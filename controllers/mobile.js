const fs = require("fs");
// const session = require("express-session");
var moment = require("moment");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
const { Op, Member, Absensi, DinasLuar, Holiday } = require("../db/models");

const { text_limit } = require("../helpers/tools");
const { validationResult } = require("express-validator");
// const holiday = require("../db/models/holiday");

const controllers = {};

controllers.auth = async function (req, res) {
    const body = req.body;
    const url = "https://sdm.unsam.ac.id/user_federation/auth/" + body.username;

    if (body.username != "" && body.password != "") {
        var optionsGET = {
            uri: url,
            method: "GET",
        };
        request(optionsGET, async function (errorGET, responseGET, bodyGET) {
            if (!errorGET && responseGET.statusCode == 200) {
                const json = JSON.parse(bodyGET);

                const id = json.id;
                const username = json.username;
                const firstName = json.firstName;
                const nip = body.username;

                var options = {
                    uri: url,
                    method: "POST",
                    json: { password: body.password },
                };
                // request
                request(options, async function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        const accessToken = jwt.sign(
                            { firstName, username },
                            process.env.ACCESS_TOKEN_SECRET,
                            { expiresIn: "360d" }
                        );

                        const refreshToken = jwt.sign(
                            { firstName, username },
                            process.env.REFRESH_TOKEN_SECRET,
                            { expiresIn: "360d" }
                        );

                        // delete post
                        await Member.destroy({
                            where: {
                                username: username,
                            },
                        });

                        const data = {};
                        data["username"] = username;
                        data["fullname"] = firstName;
                        data["refreshToken"] = refreshToken;
                        data["nip"] = nip;
                        data["createdAt"] = new Date();
                        data["updatedAt"] = new Date();
                        // insert Post
                        const insert = await Member.create(data);
                        // process
                        if (!insert) {
                            error = 1;
                            error_msg = "Proses insert agenda gagal dilakukan.";
                        }

                        res.cookie("refreshToken", refreshToken, {
                            httpOnly: true,
                            maxAge: 24 * 60 * 60 * 10000,
                        });

                        req.session.member_id = id;
                        req.session.nip = nip;
                        req.session.name = firstName;
                        res.json({
                            error: false,
                            accessToken,
                            nip: nip,
                            fullname: firstName,
                        });
                    } else {
                        res.status(401).json({ error: "Password Gagal" });
                    }
                });
            } else {
                res.status(401).json({ error: "NIP Tidak Ditemukan" });
            }
        });
    } else {
        res.status(401).json({
            error: "Username atau Password Tidak Ditemukan",
        });
    }
};

controllers.loginChecking = async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // filter
        var err_msg = "";
        let num = 0;
        errors.array().forEach((error) => {
            if (num != 0) err_msg += "<br>";
            err_msg += error.msg;

            num++;
        });
        res.status(400).json({ error: err_msg, status: "error" });
    } else {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token == null) return res.sendStatus(401);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(401);
        });
        res.status(200).json({
            status: "success",
            error: false,
        });
    }
};

controllers.checkToken = async function (req, res) {
    const param = req.params;
    if (param.token != "" && param.nip != "") {
        // data
        const data = await Member.findOne({
            where: { nip: param.nip, refreshToken: param.token },
        });
        // filter
        if (data) {
            res.status(200).json({
                status: "success",
                error: "Proses Login Berhasil",
            });
        } else {
            res.status(401).json({ error: "Member tidak ditemukan" });
        }
    } else {
        res.status(401).json({ error: "Token tidak boleh kosong" });
    }
};

function calculateDays(startDate, endDate, restStart, restEnd) {
    var durasiMasuk = 0;
    if (startDate != "") {
        console.log("1");
        console.log(startDate);
        console.log("1");
        var start_date = moment(startDate, "YYYY-MM-DD HH:mm:ss");
        var rest_start = moment(restStart, "YYYY-MM-DD HH:mm:ss");
        var durationMasuk = moment.duration(rest_start.diff(start_date));
        durasiMasuk = durationMasuk.asMinutes();
    }

    var durasiKeluar = 0;
    if (endDate != "") {
        console.log("2");
        console.log(endDate);
        console.log("2");
        var rest_end = moment(restEnd, "YYYY-MM-DD HH:mm:ss");
        var end_date = moment(endDate, "YYYY-MM-DD HH:mm:ss");
        var durationKeluar = moment.duration(end_date.diff(rest_end));
        durasiKeluar = durationKeluar.asMinutes();
    }

    // count
    var total = durasiMasuk + durasiKeluar;
    console.log("durasiMasuk :" + durasiMasuk);
    console.log("durasiKeluar :" + durasiKeluar);
    console.log("total :" + total);
    var r = total % 60;
    var s = total - r;
    var t = s / 60;

    console.log(t.toString());
    console.log(r.toString());
    // return
    return t.toString() + "hr" + r.toString() + "minutes";
}

controllers.dashboard = async function (req, res) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var nip;
    var firstName;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        nip = decoded.username;
        firstName = decoded.firstName;
    });
    var datetime = new Date();
    let date = ("0" + datetime.getDate()).slice(-2);
    let month = ("0" + (datetime.getMonth() + 1)).slice(-2);
    let year = datetime.getFullYear();
    var bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    let hours = datetime.getHours();
    let minutes = datetime.getMinutes();
    var status = "active";
    var masuk = "";
    var keluar = "";
    var tanggal = date + " " + bulan[datetime.getMonth()] + " " + year;
    var tgl = year + "-" + month + "-" + date;
    var totalKerja = "00hr00minutes";
    var days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jum'at",
        "Sabtu",
    ];
    var dayName = days[datetime.getDay()];
    // check weekend
    if (dayName == "Sabtu" || dayName == "Minggu") {
        status = "weekend";
    }
    // check holiday
    if (status == "active") {
        // check holday
        const q_holiday = await Holiday.findAndCountAll({
            where: {
                dateHoliday: { [Op.like]: datetime.toISOString().slice(0, 10) },
            },
        });
        if (q_holiday.count > 0) {
            status = "holiday";
        }
    }
    // check dinas luar
    if (status == "active") {
        const dinasLuar = await DinasLuar.findAll({
            attributes: ["id", "start_date", "end_date"],
            where: { nip: nip, status: "approve" },
        });
        dinasLuar.forEach(async (e) => {
            let start_date = new Date(e.start_date).getTime();
            let end_date = new Date(e.end_date).getTime();
            if (start_date <= datetime && end_date >= datetime) {
                status = "dl";
            }
        });
    }
    if (status == "active") {
        let intime = false;
        let posisi = "";
        if (hours >= 7 && hours <= 12) {
            if (hours == 7 && minutes >= 30) {
                intime = true;
                posisi = "masuk";
            } else if (hours == 12 && minutes <= 30) {
                intime = true;
                posisi = "masuk";
            } else if (hours > 7 && hours < 12) {
                intime = true;
                posisi = "masuk";
            }
        } else if (hours >= 13 && hours <= 16 && dayName != "Friday") {
            if (hours == 13 && minutes >= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours == 16 && minutes == 0) {
                intime = true;
                posisi = "keluar";
            } else if (hours > 13 && hours < 16) {
                intime = true;
                posisi = "keluar";
            }
        } else if (hours >= 13 && hours <= 16 && dayName == "Friday") {
            if (hours == 13 && minutes >= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours == 16 && minutes <= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours > 13 && hours < 16) {
                intime = true;
                posisi = "keluar";
            }
        }
        if (intime == false) {
            status = "outtime";
        }
        // if (status == "active") {
        // get info absensi
        await Absensi.findAll({
            limit: 1,
            attributes: ["id", "masuk", "keluar", "tanggal"],
            where: {
                tanggal: { [Op.like]: datetime.toISOString().slice(0, 10) },
                nip: nip,
            },
        }).then(async (value) => {
            if (value) {
                value.forEach(async (e) => {
                    if (e.masuk != null) {
                        var exp = e.masuk.split(":");
                        masuk = exp[0] + ":" + exp[1];
                    }
                    if (e.keluar != null) {
                        var exp = e.keluar.split(":");
                        keluar = exp[0] + ":" + exp[1];
                    }
                });

                if (status == "active") {
                    if (masuk != "" && posisi == "masuk") {
                        status = "lock";
                    } else if (keluar != "" && posisi == "keluar") {
                        status = "lock";
                    }
                }
                // if (status == "active") {
                //     if (masuk != "" && ) {
                //     }
                // }
            }
        });
        // }
    }

    var start_date = masuk != "" ? tgl + " " + masuk + ":00" : "";
    var end_date = keluar != "" ? tgl + " " + keluar + ":00" : "";
    var rest_start = tgl + " " + "12:30:00";
    var rest_end = tgl + " " + (dayName == "jum'at" ? "14:00:00" : "13:30:00");

    console.log("start_date");
    console.log(start_date);
    console.log("start_date");
    console.log("end_date");
    console.log(end_date);
    console.log("end_date");

    totalKerja = calculateDays(start_date, end_date, rest_start, rest_end);

    // return
    res.status(200).json({
        status: "success",
        statusAbsensi: status,
        masuk: masuk,
        keluar: keluar,
        tanggal: dayName + ", " + tanggal,
        hari: dayName,
        fullname: firstName,
        nip: nip,
        total: totalKerja,
        error: false,
    });
};

controllers.absen_dosen = async function (req, res) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var nip;
    var firstName;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        nip = decoded.username;
        firstName = decoded.firstName;
    });

    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let year = date_ob.getFullYear();
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let time = hours + ":" + minutes;
    var status = "active";
    var bulan = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
    ];
    var days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jum'at",
        "Sabtu",
    ];
    var dayName = days[date_ob.getDay()];
    // check weekend
    if (dayName == "Sabtu" || dayName == "Minggu") {
        status = "weekend";
    }
    // check holiday
    if (status == "active") {
        // check holday
        const q_holiday = await Holiday.findAndCountAll({
            where: {
                dateHoliday: { [Op.like]: date_ob.toISOString().slice(0, 10) },
            },
        });
        if (q_holiday.count > 0) {
            status = "holiday";
        }
    }
    // check dinas luar
    if (status == "active") {
        const dinasLuar = await DinasLuar.findAll({
            attributes: ["id", "start_date", "end_date"],
            where: { nip: nip, status: "approve" },
        });
        dinasLuar.forEach(async (e) => {
            let start_date = new Date(e.start_date).getTime();
            let end_date = new Date(e.end_date).getTime();

            if (start_date <= date_ob && end_date >= date_ob) {
                status = "dl";
            }
        });
    }
    // check status active
    if (status == "active") {
        let intime = false;
        let posisi = "";
        // filter intime
        if (hours >= 7 && hours <= 12) {
            if (hours == 7 && minutes >= 30) {
                intime = true;
                posisi = "masuk";
            } else if (hours == 12 && minutes <= 30) {
                intime = true;
                posisi = "masuk";
            } else if (hours > 7 && hours < 12) {
                intime = true;
                posisi = "masuk";
            }
        } else if (hours >= 13 && hours <= 16 && dayName != "Friday") {
            if (hours == 13 && minutes >= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours == 16 && minutes == 0) {
                intime = true;
                posisi = "keluar";
            } else if (hours > 13 && hours < 16) {
                intime = true;
                posisi = "keluar";
            }
        } else if (hours >= 13 && hours <= 16 && dayName == "Friday") {
            if (hours == 13 && minutes >= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours == 16 && minutes <= 30) {
                intime = true;
                posisi = "keluar";
            } else if (hours > 13 && hours < 16) {
                intime = true;
                posisi = "keluar";
            }
        }
        // check intime
        if (intime) {
            await Absensi.findAll({
                limit: 1,
                attributes: ["id", "masuk", "keluar", "tanggal"],
                where: {
                    tanggal: { [Op.like]: date_ob.toISOString().slice(0, 10) },
                    nip: nip,
                },
            }).then(async (value) => {
                if (value.length > 0) {
                    var masuk = "";
                    var keluar = "";
                    var id = "";
                    value.forEach(async (e) => {
                        id = e.id;
                        masuk = e.masuk;
                        keluar = e.keluar;
                        tanggal = e.tanggal;
                    });
                    if (posisi == "masuk" && masuk != null) {
                        res.status(200).json({
                            error: false,
                            error_msg:
                                "Absensi untuk hari ini sudah pernah dilakukan",
                        });
                    } else if (posisi == "keluar" && keluar != null) {
                        res.status(200).json({
                            error: false,
                            error_msg:
                                "Absensi untuk hari ini sudah pernah dilakukan",
                        });
                    } else {
                        const data = {};
                        if (posisi == "masuk") {
                            data["masuk"] = time;
                        } else {
                            data["keluar"] = time;
                        }
                        await Absensi.update(data, {
                            where: { id: id },
                        }).then(async (value) => {
                            res.status(200).json({
                                error: false,
                                error_msg:
                                    "Proses absensi " +
                                    posisi +
                                    " berhasil dilakukan",
                            });
                        });
                    }
                } else {
                    const data = {};
                    data["nip"] = nip;
                    data["tanggal"] = year + "-" + month + "-" + date;
                    if (posisi == "masuk") {
                        data["masuk"] = time;
                    } else {
                        data["keluar"] = time;
                    }
                    data["createdAt"] = new Date();
                    data["updatedAt"] = new Date();
                    // insert
                    const insert = await Absensi.create(data);
                    // process
                    if (!insert) {
                        res.status(200).json({
                            error: true,
                            error_msg: "Proses absensi gagal dilakukan",
                        });
                    } else {
                        res.status(200).json({
                            error: false,
                            error_msg: "Proses absensi berhasil dilakukan",
                        });
                    }
                }
            });
        } else {
            res.status(200).json({
                error: true,
                error_msg: "Absensi tidak dapat dilakukan diluar waktu",
            });
        }
    } else {
        var msg = "Absensi tidak dapat dilakukan";
        if (status == "weekend") {
            msg = "Absensi tidak dapat dilakukan diwaktu weekend";
        } else if (status == "holiday") {
            msg = "Absensi tidak dapat dilakukan diwaktu holiday";
        } else if (status == "dl") {
            msg = "Absensi tidak dapat dilakukan diwaktu dinas luar";
        }
        res.status(200).json({
            error: true,
            error_msg: msg,
        });
    }
};

function getDayName(dateStr, locale) {
    var date = new Date(dateStr);
    return date.toLocaleDateString(locale, { weekday: "long" });
}

// riwayat absensi
controllers.riwayatAbsensi = async function (req, res) {
    var nip;
    var firstName;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var bulan = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MEI",
        "JUN",
        "JUL",
        "AGT",
        "SEP",
        "OKT",
        "NOV",
        "DES",
    ];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        nip = decoded.username;
        firstName = decoded.firstName;
    });
    const body = req.body;
    var perpage = body.perpage;
    var page = body.pageNumber;
    var limit = 0;
    if (body.pageNumber != undefined) {
        limit = perpage * page;
    }
    try {
        const q_total = await Absensi.findAndCountAll({
            where: {
                nip: nip,
            },
        });
        const total = q_total.count;
        var list = {};
        if (total > 0) {
            await Absensi.findAll({
                limit: limit * 1,
                order: [["tanggal", "DESC"]],
                attributes: ["id", "masuk", "keluar", "tanggal"],
                where: {
                    nip: nip,
                },
            }).then(async (value) => {
                var i = 0;
                value.forEach(async (e) => {
                    let tgl = e.tanggal.split("-");
                    var dayName = getDayName(
                        tgl[0] + "/" + tgl[2] + "/" + tgl[2],
                        "nl-NL"
                    );
                    var start_date =
                        e.masuk != null
                            ? e.tanggal + " " + e.masuk + ":00"
                            : "";
                    var end_date =
                        e.keluar != null
                            ? e.tanggal + " " + e.keluar + ":00"
                            : "";
                    var rest_start = e.tanggal + " " + "12:30:00";
                    var rest_end =
                        e.tanggal +
                        " " +
                        (dayName == "jum'at" ? "14:00:00" : "13:30:00");
                    totalKerja = calculateDays(
                        start_date,
                        end_date,
                        rest_start,
                        rest_end
                    );
                    list[i] = {
                        id: e.id,
                        masuk: e.masuk,
                        keluar: e.keluar,
                        tanggal: tgl[2],
                        bulan: bulan[parseInt(tgl[1]) - 1],
                        tahun: tgl[0],
                        kerja: totalKerja,
                        fulldate: e.tanggal,
                    };
                    i++;
                });
                // console.log("0");
                console.log("====0");
                console.log(list);
                res.status(200).json({
                    data: list,
                    total: total,
                    error: false,
                    error_msg: "Berhasil",
                });
            });
        } else {
            console.log("====1");
            console.log(list);
            res.status(200).json({
                data: list,
                total: total,
                error: false,
                error_msg: "Berhasil",
            });
        }
    } catch (err) {
        res.status(400).json({ error: true, error_msg: err, status: "error" });
    }
};

// riwayat dinas luar
controllers.riwayatDl = async function (req, res) {
    var nip;
    var firstName;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        nip = decoded.username;
        firstName = decoded.firstName;
    });

    const body = req.body;
    var perpage = body.perpage;
    var page = body.pageNumber;
    var limit = 0;
    if (body.pageNumber != undefined) {
        limit = perpage * page;
    }
    try {
        const q_total = await DinasLuar.findAndCountAll({
            where: {
                nip: nip,
            },
        });
        const total = q_total.count;
        var list = {};
        if (total > 0) {
            await DinasLuar.findAll({
                limit: limit * 1,
                order: [["createdAt", "DESC"]],
                attributes: ["id", "start_date", "end_date", "status", "sk"],
                where: {
                    nip: nip,
                },
            }).then(async (value) => {
                var i = 0;
                value.forEach(async (e) => {
                    list[i] = {
                        id: e.id,
                        start_date: convertDate(e.start_date),
                        end_date: convertDate(e.end_date),
                        status: e.status,
                        sk: e.sk,
                    };
                    i++;
                });
                res.status(200).json({
                    data: list,
                    total: total,
                    error_msg: "Berhasil",
                    error: false,
                });
            });
        } else {
            res.status(200).json({
                data: list,
                total: total,
                error_msg: "Berhasil",
                error: false,
            });
        }
    } catch (err) {
        res.status(400).json({ error: true, error_msg: err, status: "error" });
    }
};

function convertDate(date) {
    const d = new Date(date);
    let day = d.getDate();
    let year = d.getFullYear();
    let month = d.getMonth();
    return year + "-" + (month.length == 1 ? "0" + month : month) + "-" + day;
}

// add dinas luar
controllers.addDinasLuar = async function (req, res) {
    const errors = validationResult(req);
    if (req.file == undefined) {
        res.status(401).json({
            error: "Anda wajib mengupload photo SK photo",
            status: "error",
        });
    } else {
        if (!errors.isEmpty()) {
            // filter
            var err_msg = "";
            let num = 0;
            errors.array().forEach((error) => {
                if (num != 0) err_msg += "<br>";
                err_msg += error.msg;

                num++;
            });
            res.status(400).json({ error: err_msg, status: "error" });
        } else {
            const body = req.body;
            const data = {};
            data["nip"] = req.session.nip;
            data["start_date"] = body.start_date;
            data["end_date"] = body.end_date;
            data["status"] = "approve";
            data["sk"] = req.file.filename;
            data["createdAt"] = new Date();
            data["updatedAt"] = new Date();
            const insert = await DinasLuar.create(data);
            if (!insert) {
                res.status(401).json({
                    error: "Proses pengajuan dinas luar gagal dilakukan.",
                    status: "error",
                });
            } else {
                res.status(200).json({
                    status: "success",
                    error: "Berhasil",
                });
            }
        }
    }
};

module.exports = controllers;
