const fs = require("fs");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
const moment = require("moment");

const {
    Op,
    Member,
    Absensi,
    Holiday,
    Izin,
    Setting,
} = require("../../db/models");

const { text_limit } = require("../../helpers/tools");
const {
    calculateDays,
    LocalDates,
    getDayName2,
    parsingDate,
    convertDate,
} = require("../../helpers/date_ops");
const { validationResult } = require("express-validator");

const controllers = {};

controllers.public = async (req, res) => {
    res.render("pages/public/index");
};

controllers.auth = async (req, res) => {
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
        res.status(400).json({ error: true, error_msg: err_msg });
    } else {
        const body = req.body;
        try {
            const member = await Member.findOne({
                where: { username: body.username },
            });
            if (member) {
                const validPassword = await bcrypt.compare(
                    body.password,
                    member.password
                );

                var kode = member.kode;

                if (!validPassword)
                    return res.status(400).json("Password Tidak Valid");

                if (typeof req.session.loginList !== "undefined") {
                    if (!req.session.loginList.includes(kode)) {
                        var list = [];
                        var i = 0;
                        req.session.loginList.forEach((element) => {
                            console.log(element);
                            list[i] = element;
                            i++;
                        });
                        list[i] = kode;
                        req.session.loginList = list;
                    }
                } else {
                    req.session.loginList = [kode];
                }

                const accessToken = jwt.sign(
                    { kode },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "360d" }
                );

                res.status(200).json({ kode, accessToken });
            } else {
                res.status(400).json("Username tidak ditemukan");
            }
        } catch (error) {
            res.status(400).json(error);
        }
    }
};

controllers.dashboard = async (req, res) => {
    const param = req.params;
    var kode = param.kode;
    var letitude;
    var longitude;
    var jarak_min;

    await Setting.findAll({
        attributes: ["setting_name", "setting_value"],
    }).then(async (value) => {
        if (value) {
            value.forEach(async (e) => {
                if (e.setting_name == "letitude") {
                    letitude = e.setting_value;
                }
                if (e.setting_name == "longitude") {
                    longitude = e.setting_value;
                }
                if (e.setting_name == "jarak") {
                    jarak_min = e.setting_value;
                }
            });
        }
    });

    res.render("pages/guru_tendik/dashboard", {
        kode: kode,
        letitude: letitude,
        longitude: longitude,
        jarak_min: jarak_min,
    });
};

controllers.dataDashboard = async (req, res) => {
    const param = req.params;
    var kode = param.kode;
    var fullname;
    var nip;
    var memberId;
    await Member.findOne({
        where: { kode: kode },
    }).then(async (value) => {
        if (value) {
            fullname = value.nama;
            nip = value.nip;
            memberId = value.id;
        }
    });

    var d = await LocalDates();
    var year = d.year;
    var month = d.month;
    var date = d.day;
    var monthName = d.monthName;
    var date_dash = d.dateDash;

    var hours = d.hours;
    var minutes = d.minutes;
    var second = d.second;

    var tanggal = date + " " + monthName + " " + year;
    var status = "active";
    var masuk = "";
    var keluar = "";
    var totalKerja = "00hr00minutes";
    var dayName = d.dayName;

    var j_mulai_absensi_masuk = "";
    var m_mulai_absensi_masuk = "";
    var j_akhir_absensi_masuk = "";
    var m_akhir_absensi_masuk = "";
    var j_mulai_absensi_keluar = "";
    var m_mulai_absensi_keluar = "";
    var j_akhir_absensi_keluar = "";
    var m_akhir_absensi_keluar = "";
    var hari_libur_mingguan = "";

    await Setting.findAll({
        attributes: ["setting_name", "setting_value"],
    }).then(async (value) => {
        if (value) {
            value.forEach(async (e) => {
                if (e.setting_name == "mulai_absensi_masuk") {
                    var exp = e.setting_value.split(":");
                    j_mulai_absensi_masuk = exp[0];
                    m_mulai_absensi_masuk = exp[1];
                }
                if (e.setting_name == "akhir_absensi_masuk") {
                    var exp = e.setting_value.split(":");
                    j_akhir_absensi_masuk = exp[0];
                    m_akhir_absensi_masuk = exp[1];
                }
                if (e.setting_name == "mulai_absensi_keluar") {
                    var exp = e.setting_value.split(":");
                    j_mulai_absensi_keluar = exp[0];
                    m_mulai_absensi_keluar = exp[1];
                }
                if (e.setting_name == "akhir_absensi_keluar") {
                    var exp = e.setting_value.split(":");
                    j_akhir_absensi_keluar = exp[0];
                    m_akhir_absensi_keluar = exp[1];
                }
                if (e.setting_name == "hari_libur_mingguan") {
                    hari_libur_mingguan = JSON.parse(e.setting_value);
                }
                if (e.setting_name == "letitude") {
                    letitude = e.setting_value;
                }
                if (e.setting_name == "longitude") {
                    longitude = e.setting_value;
                }
                if (e.setting_name == "jarak") {
                    jarak_min = e.setting_value;
                }
            });
        }
    });
    for (x in hari_libur_mingguan) {
        if (x.toUpperCase() == dayName.toUpperCase()) {
            status = "weekend";
        }
    }
    var fixDate = new Date(date_dash);
    if (status == "active") {
        var holiday = {};
        var i = 0;
        await Holiday.findAll({
            attributes: ["id", "repeat", "dateHoliday"],
        }).then(async (e) => {
            if (e) {
                e.forEach(async (value) => {
                    if (value.repeat == "annually") {
                        var dates = moment(value.dateHoliday, "YYYY-MM-DD");
                        var dy = dates.format("DD");
                        var mon = dates.format("MM");
                        const y = dates.format("YYYY");
                        if (year != y) {
                            // looping
                            for (var j = y; j <= year; j++) {
                                var newDate = moment(
                                    j + "-" + mon + "-" + dy,
                                    "YYYY-MM-DD"
                                ).format("YYYY-MM-DD");
                                if (
                                    Object.values(holiday).indexOf(newDate) >=
                                        0 ==
                                    false
                                ) {
                                    holiday[i] = newDate;
                                    i++;
                                }
                            }
                        } else {
                            var newDate = moment(
                                yee + "-" + mon + "-" + dy,
                                "YYYY-MM-DD"
                            ).format("YYYY-MM-DD");

                            if (
                                Object.values(holiday).indexOf(newDate) >= 0 ==
                                false
                            ) {
                                holiday[i] = newDate;
                                i++;
                            }
                        }
                    } else {
                        if (
                            Object.values(holiday).indexOf(newDate) >= 0 ==
                            false
                        ) {
                            holiday[i] = value.dateHoliday;
                            i++;
                        }
                    }
                });
            }
        });
        var newFixDate = moment(fixDate, "YYYY-MM-DD").format("YYYY-MM-DD");
        if (Object.values(holiday).indexOf(newFixDate) >= 0 == true) {
            status = "holiday";
        }
    }
    // check dinas luar
    if (status == "active") {
        const izin = await Izin.findAll({
            attributes: ["id", "start_date", "end_date"],
            where: { memberId: memberId },
        });
        izin.forEach(async (e) => {
            let start_date = new Date(e.start_date).getTime();
            let end_date = new Date(e.end_date).getTime();
            if (start_date <= date_dash && end_date >= date_dash) {
                status = "dl";
            }
        });
    }
    // status = "active";
    if (status == "active") {
        let intime = false;
        let posisi = "";

        if (hours >= j_mulai_absensi_masuk && hours <= j_akhir_absensi_masuk) {
            if (
                hours == j_mulai_absensi_masuk &&
                minutes >= m_mulai_absensi_masuk
            ) {
                intime = true;
                posisi = "masuk";
            } else if (
                hours == j_akhir_absensi_masuk &&
                minutes <= m_akhir_absensi_masuk
            ) {
                intime = true;
                posisi = "masuk";
            } else if (
                hours > j_mulai_absensi_masuk &&
                hours < j_akhir_absensi_masuk
            ) {
                intime = true;
                posisi = "masuk";
            }
        } else if (
            hours >= j_mulai_absensi_keluar &&
            hours <= j_akhir_absensi_keluar
        ) {
            if (
                hours == j_mulai_absensi_keluar &&
                minutes >= m_mulai_absensi_keluar
            ) {
                intime = true;
                posisi = "keluar";
            } else if (
                hours == j_akhir_absensi_keluar &&
                minutes == m_akhir_absensi_keluar
            ) {
                intime = true;
                posisi = "keluar";
            } else if (
                hours > j_mulai_absensi_keluar &&
                hours < j_akhir_absensi_keluar
            ) {
                intime = true;
                posisi = "keluar";
            }
        }
        if (intime == false) {
            status = "outtime";
        }
        // get info absensi
        await Absensi.findAll({
            limit: 1,
            attributes: ["id", "masuk", "keluar", "tanggal"],
            include: {
                required: true,
                model: Member,
                attributes: ["nama", "nip"],
                where: {
                    kode: kode,
                },
            },
            where: {
                tanggal: { [Op.like]: fixDate },
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
            }
        });
    }

    var start_date = masuk != "" ? date_dash + " " + masuk + ":00" : "";
    var end_date = keluar != "" ? date_dash + " " + keluar + ":00" : "";
    var rest_start = date_dash + " " + "12:30:00";
    var rest_end =
        date_dash + " " + (dayName == "jum'at" ? "14:00:00" : "13:30:00");

    totalKerja = await calculateDays(
        start_date,
        end_date,
        rest_start,
        rest_end
    );

    res.status(200).json({
        statusAbsensi: status,
        masuk: masuk,
        keluar: keluar,
        tanggal: dayName + ", " + tanggal,
        hari: dayName,
        fullname: fullname,
        nip: nip,
        total: totalKerja,
    });
};

function getDistanceBetweenPoints(
    latitude1,
    longitude1,
    latitude2,
    longitude2,
    unit = "miles"
) {
    let theta = longitude1 - longitude2;
    let distance =
        60 *
        1.1515 *
        (180 / Math.PI) *
        Math.acos(
            Math.sin(latitude1 * (Math.PI / 180)) *
                Math.sin(latitude2 * (Math.PI / 180)) +
                Math.cos(latitude1 * (Math.PI / 180)) *
                    Math.cos(latitude2 * (Math.PI / 180)) *
                    Math.cos(theta * (Math.PI / 180))
        );
    if (unit == "miles") {
        return Math.round(distance, 2);
    } else if (unit == "kilometers") {
        console.log("distance");
        console.log(distance);
        console.log(distance * 1.609344);
        console.log("distance");
        return Math.round(distance * 1.609344, 2);
    } else if (unit == "meters") {
        return Math.round(distance * 1.609344 * 1000);
    }
}

controllers.absensi = async function (req, res) {
    const errors = validationResult(req); // validator const
    if (!errors.isEmpty()) {
        // filter
        var err_msg = "";
        let num = 0;
        errors.array().forEach((error) => {
            err_msg += error.msg;
            if (num != 0) err_msg += "<br>";
            num++;
        });
        res.status(400).json({ msg: err_msg });
    } else {
        var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        var body = req.body;

        const param = req.params;
        var kode = param.kode;
        var fullname;
        var memberId;
        await Member.findOne({
            where: { kode: kode },
        }).then(async (value) => {
            if (value) {
                fullname = value.fullname;
                memberId = value.id;
            }
        });

        var d = await LocalDates();
        var year = d.year;
        var month = d.month;
        var date = d.day;
        var monthName = d.monthName;
        var date_dash = d.dateDash;
        var hours = d.hours;
        var minutes = d.minutes;
        let time = hours + ":" + minutes;
        var tanggal = date + " " + monthName + " " + year;
        var status = "active";
        var totalKerja = "00hr00minutes";
        var dayName = d.dayName;

        var j_mulai_absensi_masuk = "";
        var m_mulai_absensi_masuk = "";
        var j_akhir_absensi_masuk = "";
        var m_akhir_absensi_masuk = "";
        var j_mulai_absensi_keluar = "";
        var m_mulai_absensi_keluar = "";
        var j_akhir_absensi_keluar = "";
        var m_akhir_absensi_keluar = "";
        var hari_libur_mingguan = "";

        var jarak_min = 0;
        var letitude_pusat = 0.0;
        var longitude_pusat = 0.0;

        await Setting.findAll({
            attributes: ["setting_name", "setting_value"],
        }).then(async (value) => {
            if (value) {
                value.forEach(async (e) => {
                    if (e.setting_name == "mulai_absensi_masuk") {
                        var exp = e.setting_value.split(":");
                        j_mulai_absensi_masuk = exp[0];
                        m_mulai_absensi_masuk = exp[1];
                    }
                    if (e.setting_name == "akhir_absensi_masuk") {
                        var exp = e.setting_value.split(":");
                        j_akhir_absensi_masuk = exp[0];
                        m_akhir_absensi_masuk = exp[1];
                    }
                    if (e.setting_name == "mulai_absensi_keluar") {
                        var exp = e.setting_value.split(":");
                        j_mulai_absensi_keluar = exp[0];
                        m_mulai_absensi_keluar = exp[1];
                    }
                    if (e.setting_name == "akhir_absensi_keluar") {
                        var exp = e.setting_value.split(":");
                        j_akhir_absensi_keluar = exp[0];
                        m_akhir_absensi_keluar = exp[1];
                    }
                    if (e.setting_name == "hari_libur_mingguan") {
                        console.log("e.setting_value");
                        console.log(e.setting_value);
                        console.log(typeof e.setting_value);
                        console.log("e.setting_value");
                        hari_libur_mingguan = JSON.parse(e.setting_value);
                    }

                    if (e.setting_name == "letitude") {
                        letitude_pusat = e.setting_value;
                    }

                    if (e.setting_name == "longitude") {
                        longitude_pusat = e.setting_value;
                    }

                    if (e.setting_name == "jarak") {
                        jarak_min = e.setting_value;
                    }
                });
            }
        });

        var jarak = getDistanceBetweenPoints(
            body.latitude,
            body.longitude,
            letitude_pusat,
            longitude_pusat,
            "meters"
        );

        if (jarak > jarak_min) {
            status = "luar_posisi";
        }

        if (status == "active") {
            for (x in hari_libur_mingguan) {
                if (x.toUpperCase() == dayName.toUpperCase()) {
                    status = "weekend";
                }
            }
        }
        var fixDate = new Date(date_dash);
        // check holiday
        if (status == "active") {
            var holiday = {};
            var i = 0;
            await Holiday.findAll({
                attributes: ["id", "repeat", "dateHoliday"],
            }).then(async (e) => {
                if (e) {
                    e.forEach(async (value) => {
                        if (value.repeat == "annually") {
                            var dates = moment(value.dateHoliday, "YYYY-MM-DD");
                            var dy = dates.format("DD");
                            var mon = dates.format("MM");
                            const y = dates.format("YYYY");
                            if (year != y) {
                                // looping
                                for (var j = y; j <= year; j++) {
                                    var newDate = moment(
                                        j + "-" + mon + "-" + dy,
                                        "YYYY-MM-DD"
                                    ).format("YYYY-MM-DD");
                                    if (
                                        Object.values(holiday).indexOf(
                                            newDate
                                        ) >=
                                            0 ==
                                        false
                                    ) {
                                        holiday[i] = newDate;
                                        i++;
                                    }
                                }
                            } else {
                                var newDate = moment(
                                    yee + "-" + mon + "-" + dy,
                                    "YYYY-MM-DD"
                                ).format("YYYY-MM-DD");

                                if (
                                    Object.values(holiday).indexOf(newDate) >=
                                        0 ==
                                    false
                                ) {
                                    holiday[i] = newDate;
                                    i++;
                                }
                            }
                        } else {
                            if (
                                Object.values(holiday).indexOf(newDate) >= 0 ==
                                false
                            ) {
                                holiday[i] = value.dateHoliday;
                                i++;
                            }
                        }
                    });
                }
            });
            var newFixDate = moment(fixDate, "YYYY-MM-DD").format("YYYY-MM-DD");
            if (Object.values(holiday).indexOf(newFixDate) >= 0 == true) {
                status = "holiday";
            }
        }
        // check dinas luar
        if (status == "active") {
            const izin = await Izin.findAll({
                attributes: ["id", "start_date", "end_date"],
                where: { memberId: memberId },
            });
            izin.forEach(async (e) => {
                let start_date = new Date(e.start_date).getTime();
                let end_date = new Date(e.end_date).getTime();
                if (start_date <= date_dash && end_date >= date_dash) {
                    status = "dl";
                }
            });
        }
        // check status active
        if (status == "active") {
            let intime = false;
            let posisi = "";
            if (
                hours >= j_mulai_absensi_masuk &&
                hours <= j_akhir_absensi_masuk
            ) {
                if (
                    hours == j_mulai_absensi_masuk &&
                    minutes >= m_mulai_absensi_masuk
                ) {
                    intime = true;
                    posisi = "masuk";
                } else if (
                    hours == j_akhir_absensi_masuk &&
                    minutes <= m_akhir_absensi_masuk
                ) {
                    intime = true;
                    posisi = "masuk";
                } else if (
                    hours > j_mulai_absensi_masuk &&
                    hours < j_akhir_absensi_masuk
                ) {
                    intime = true;
                    posisi = "masuk";
                }
            } else if (
                hours >= j_mulai_absensi_keluar &&
                hours <= j_akhir_absensi_keluar
            ) {
                if (
                    hours == j_mulai_absensi_keluar &&
                    minutes >= m_mulai_absensi_keluar
                ) {
                    intime = true;
                    posisi = "keluar";
                } else if (
                    hours == j_akhir_absensi_keluar &&
                    minutes == m_akhir_absensi_keluar
                ) {
                    intime = true;
                    posisi = "keluar";
                } else if (
                    hours > j_mulai_absensi_keluar &&
                    hours < j_akhir_absensi_keluar
                ) {
                    intime = true;
                    posisi = "keluar";
                }
            }
            intime = true;
            // check intime
            if (intime) {
                await Absensi.findAll({
                    limit: 1,
                    attributes: ["id", "masuk", "keluar", "tanggal"],
                    where: {
                        tanggal: { [Op.like]: fixDate },
                        memberId: memberId,
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
                            res.status(404).json(
                                "Absensi untuk masuk hari ini sudah pernah dilakukan"
                            );
                        } else if (posisi == "keluar" && keluar != null) {
                            res.status(404).json(
                                "Absensi untuk keluar hari ini sudah pernah dilakukan"
                            );
                        } else {
                            const data = {};
                            if (posisi == "masuk") {
                                data["masuk"] = time;
                                data["latitude_masuk"] = body.latitude;
                                data["longitude_masuk"] = body.longitude;
                            } else {
                                data["keluar"] = time;
                                data["latitude_keluar"] = body.latitude;
                                data["longitude_keluar"] = body.longitude;
                            }
                            data["updatedAt"] = new Date();
                            await Absensi.update(data, {
                                where: { id: id },
                            }).then(async (value) => {
                                res.status(200).json({
                                    msg:
                                        "Proses absensi " +
                                        posisi +
                                        " berhasil dilakukan",
                                });
                            });
                        }
                    } else {
                        const data = {};
                        data["memberId"] = memberId;
                        data["ip"] = ip;
                        data["tanggal"] = year + "-" + month + "-" + date;
                        if (posisi == "masuk") {
                            data["masuk"] = time;
                            data["latitude_masuk"] = body.latitude;
                            data["longitude_masuk"] = body.longitude;
                        } else {
                            data["keluar"] = time;
                            data["latitude_keluar"] = body.latitude;
                            data["longitude_keluar"] = body.longitude;
                        }
                        data["createdAt"] = new Date();
                        // insert
                        const insert = await Absensi.create(data);
                        // process
                        if (!insert) {
                            res.status(404).json(
                                "Proses absensi gagal dilakukan"
                            );
                        } else {
                            res.status(200).json({
                                msg: "Proses absensi berhasil dilakukan",
                            });
                        }
                    }
                });
            } else {
                res.status(404).json(
                    "Absensi tidak dapat dilakukan diluar waktu"
                );
            }
        } else {
            var msg = "Absensi tidak dapat dilakukan";
            if (status == "weekend") {
                msg = "Absensi tidak dapat dilakukan diwaktu weekend";
            } else if (status == "holiday") {
                msg = "Absensi tidak dapat dilakukan diwaktu holiday";
            } else if (status == "dl") {
                msg = "Absensi tidak dapat dilakukan diwaktu izin";
            } else if (status == "luar_posisi") {
                msg =
                    "Absensi tidak dapat dilakukan karena anda diluar jarak absensi";
            }
            res.status(404).json(msg);
        }
    }
};

controllers.riwayatAbsensi = async function (req, res) {
    const param = req.params;
    var kode = param.kode;
    res.render("pages/guru_tendik/riwayatAbsensi", {
        kode: kode,
    });
};

// riwayatAbsensi
controllers.dataRiwayatAbsensi = async function (req, res) {
    const param = req.params;
    var kode = param.kode;
    var perpage = param.perpage;
    var page = param.pageNumber;
    var fullname;
    var memberId;
    var d = await LocalDates();
    var year = d.year;
    await Member.findOne({
        where: { kode: kode },
    }).then(async (value) => {
        if (value) {
            fullname = value.fullname;
            memberId = value.id;
        }
    });

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

    var hari_libur_mingguan = "";

    await Setting.findAll({
        attributes: ["setting_name", "setting_value"],
    }).then(async (value) => {
        if (value) {
            value.forEach(async (e) => {
                if (e.setting_name == "hari_libur_mingguan") {
                    hari_libur_mingguan = JSON.parse(e.setting_value);
                }
            });
        }
    });

    const izin = await Izin.findAll({
        attributes: ["id", "start_date", "end_date"],
        where: { memberId: memberId },
    });
    var list_izin = {};
    var p = 0;
    izin.forEach(async (e) => {
        list_izin[p] = { start_date: e.start_date, end_date: e.end_date };
        p++;
    });

    var holiday = {};
    var i = 0;
    await Holiday.findAll({
        attributes: ["id", "repeat", "dateHoliday"],
    }).then(async (e) => {
        if (e) {
            e.forEach(async (value) => {
                if (value.repeat == "annually") {
                    var dates = moment(value.dateHoliday, "YYYY-MM-DD");
                    var dy = dates.format("DD");
                    var mon = dates.format("MM");
                    const y = dates.format("YYYY");
                    if (year != y) {
                        // looping
                        for (var j = y; j <= year; j++) {
                            var newDate = moment(
                                j + "-" + mon + "-" + dy,
                                "YYYY-MM-DD"
                            ).format("YYYY-MM-DD");
                            if (
                                Object.values(holiday).indexOf(newDate) >= 0 ==
                                false
                            ) {
                                holiday[i] = newDate;
                                i++;
                            }
                        }
                    } else {
                        var newDate = moment(
                            yee + "-" + mon + "-" + dy,
                            "YYYY-MM-DD"
                        ).format("YYYY-MM-DD");

                        if (
                            Object.values(holiday).indexOf(newDate) >= 0 ==
                            false
                        ) {
                            holiday[i] = newDate;
                            i++;
                        }
                    }
                } else {
                    if (Object.values(holiday).indexOf(newDate) >= 0 == false) {
                        holiday[i] = value.dateHoliday;
                        i++;
                    }
                }
            });
        }
    });
    // var newFixDate = moment(fixDate, "YYYY-MM-DD").format("YYYY-MM-DD");
    // if (Object.values(holiday).indexOf(newFixDate) >= 0 == true) {
    //     status = "holiday";
    // }

    var limit = 0;
    if (param.pageNumber != undefined) {
        limit = perpage * page;
    }
    const q_total = await Absensi.findAndCountAll({
        where: {
            memberId: memberId,
        },
    });
    const total = q_total.count;
    var list = {};
    if (total > 0) {
        var d = await LocalDates();
        var lD = d.lastDay;
        var j = d.dayIndex;
        for (i = 0; i < d.dayIndex; i++) {
            var curdate = new Date(d.year, d.monthIndex - 1, i + 2);
            var c = await parsingDate(curdate);
            var hari = parseInt(c.day) - 1;
            var status = "active";
            curdate =
                c.year +
                "-" +
                c.month +
                "-" +
                (hari.toString().length == 1
                    ? "0" + hari.toString()
                    : hari.toString());

            var newFixDate = moment(curdate, "YYYY-MM-DD").format("YYYY-MM-DD");
            var dayName = await getDayName2(newFixDate, "id-ID");
            var l = await parsingDate(curdate);
            var state = "active";
            for (x in hari_libur_mingguan) {
                if (x.toUpperCase() == dayName.toUpperCase()) {
                    status = "weekend";
                }
            }

            console.log("XXXXXXXXX");
            console.log(status);
            console.log(dayName);
            console.log("XXXXXXXXX");

            if (status == "active") {
                if (Object.values(holiday).indexOf(newFixDate) >= 0 == true) {
                    list[j] = {
                        tanggal: l.day,
                        tahun: l.year.toString(),
                        bulan: l.monthNameTriCharacter,
                        fulldate: curdate,
                        // status: false,
                        status: "holiday",
                        dayName: dayName,
                        s: "bawah",
                    };
                    j--;
                } else {
                    console.log("IZin");
                    for (p in list_izin) {
                        console.log("1============IZin");
                        console.log(list_izin[p].start_date);
                        console.log(list_izin[p].end_date);
                        console.log(newFixDate);

                        if (
                            list_izin[p].start_date <= newFixDate &&
                            list_izin[p].end_date >= newFixDate
                        ) {
                            console.log("2============IZin");
                            status = "izin";
                        }
                    }

                    console.log("IZin");

                    if (status == "izin") {
                        list[j] = {
                            tanggal: l.day,
                            tahun: l.year.toString(),
                            bulan: l.monthNameTriCharacter,
                            fulldate: curdate,
                            status: "izin",
                            dayName: dayName,
                            s: "bawah",
                        };
                        j--;
                    } else {
                        console.log("--------------------1");
                        await Absensi.findOne({
                            attributes: ["id", "masuk", "keluar", "tanggal"],
                            where: {
                                tanggal: { [Op.like]: curdate },
                                memberId: memberId,
                            },
                        }).then(async (e) => {
                            if (e) {
                                console.log("--------------------2");
                                let tgl = e.tanggal.split("-");
                                var dayName = await getDayName2(
                                    e.tanggal,
                                    "id-ID"
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
                                    (dayName == "jum'at"
                                        ? "14:00:00"
                                        : "13:30:00");

                                totalKerja = await calculateDays(
                                    start_date,
                                    end_date,
                                    rest_start,
                                    rest_end
                                );

                                list[j] = {
                                    id: e.id,
                                    masuk: e.masuk,
                                    keluar: e.keluar,
                                    tanggal: tgl[2],
                                    bulan: bulan[parseInt(tgl[1]) - 1],
                                    tahun: tgl[0],
                                    kerja: totalKerja,
                                    fulldate: e.tanggal,
                                    status: "hadir",
                                    dayName: dayName,
                                    s: "atas",
                                };
                                j--;
                            } else {
                                console.log("--------------------3");
                                list[j] = {
                                    tanggal: l.day,
                                    tahun: l.year.toString(),
                                    bulan: l.monthNameTriCharacter,
                                    fulldate: curdate,
                                    status: "tidak_hadir",
                                    dayName: dayName,
                                    s: "bawah",
                                };
                                j--;
                            }
                        });
                    }
                }
            } else {
                list[j] = {
                    tanggal: l.day,
                    tahun: l.year.toString(),
                    bulan: l.monthNameTriCharacter,
                    fulldate: curdate,
                    status: status,
                    dayName: dayName,
                    s: "bawah",
                };
                j--;
            }
        }
    }
    res.status(200).json({
        data: list,
        total: total,
    });
};

controllers.daftarDinasLuar = async function (req, res) {
    const param = req.params;
    var nip = param.nip;
    res.render("pages/dosen/daftarDinasLuar", {
        nip: nip,
    });
};

// data daftar dinas luar
controllers.dataDaftarDinasLuar = async function (req, res) {
    const param = req.params;
    var nip = param.nip;
    var perpage = param.perpage;
    var page = param.pageNumber;
    var fullname;
    await Member.findOne({
        where: { nip: nip },
    }).then(async (value) => {
        if (value) {
            fullname = value.fullname;
        }
    });

    var limit = 0;
    if (param.pageNumber != undefined) {
        limit = perpage * page;
    }

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
                var start_exp = await convertDate(e.start_date);
                sexp = start_exp.split("-");

                var end_exp = await convertDate(e.end_date);
                eexp = end_exp.split("-");

                list[i] = {
                    id: e.id,
                    start_year: sexp[0],
                    start_month: sexp[1],
                    start_day: sexp[2],
                    end_year: eexp[0],
                    end_month: eexp[1],
                    end_day: eexp[2],
                    status: e.status,
                    sk: e.sk,
                };
                i++;
            });
        });
    }
    res.status(200).json({
        data: list,
        total: total,
    });
};

// controllers.addDinasLuar = async function (req, res) {
//     const param = req.params;
//     var kode = param.kode;
//     res.render("pages/dosen/addDaftarDinasLuar", {
//         nip: kode,
//     });
// };

controllers.logout = async function (req, res) {
    if (typeof req.session.loginList !== "undefined") {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        var kode;
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            kode = decoded.kode;
        });
        if (req.session.loginList.includes(kode)) {
            const index = req.session.loginList.indexOf(kode);
            if (index > -1) {
                req.session.loginList.splice(index, 1);
            }
            res.status(200).json({
                msg: "Proses logout berhasil",
            });
        } else {
            res.status(200).json({
                msg: "Proses logout berhasil",
            });
        }
    } else {
        res.status(200).json({
            msg: "Proses logout berhasil",
        });
    }
};

// controllers.saveAddDinasLuar = async function (req, res) {
//     const errors = validationResult(req);
//     if (req.file == undefined) {
//         res.status(401).json("Anda wajib mengupload photo SK photo");
//     } else {
//         if (!errors.isEmpty()) {
//             // filter
//             var err_msg = "";
//             let num = 0;
//             errors.array().forEach((error) => {
//                 if (num != 0) err_msg += "<br>";
//                 err_msg += error.msg;

//                 num++;
//             });
//             res.status(400).json(err_msg);
//         } else {
//             const param = req.params;
//             var nip = param.nip;

//             const body = req.body;
//             const data = {};
//             data["nip"] = nip;
//             data["start_date"] = body.start_date;
//             data["end_date"] = body.end_date;
//             data["status"] = "approve";
//             data["sk"] = req.file.filename;
//             data["createdAt"] = new Date();
//             data["updatedAt"] = new Date();

//             const insert = await DinasLuar.create(data);

//             if (insert.length != 0) {
//                 res.status(200).json({
//                     error_msg: "Proses pengajuan dinas luar berhasil dilakukan",
//                 });
//             } else {
//                 res.status(401).json(
//                     "Proses pengajuan dinas luar gagal dilakukan."
//                 );
//             }
//         }
//     }
// };

// controllers.saveAddDinasLuar = async function (req, res) {
controllers.checkSess = async function (req, res) {
    if (typeof req.session.loginList !== "undefined") {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        var kode;
        console.log("=============1");
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            kode = decoded.kode;
        });
        console.log("=============2");
        if (req.session.loginList.includes(kode)) {
            console.log("=============3");
            res.status(200).json({
                kode: kode,
                msg: "Sesi Berhasil Ditemukan",
            });
        } else {
            console.log("=============4");
            res.status(400).json({
                msg: "Sesi tidak ditemukan",
            });
        }
    } else {
        console.log("=============5");
        res.status(400).json({
            msg: "Sesi tidak ditemukan",
        });
    }
};

module.exports = controllers;
