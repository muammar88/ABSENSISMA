const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
//import moment from "moment";
const moment = require("moment");

moment.locale;

const {
    Op,
    sequelize,
    Menu,
    Submenu,
    User,
    Member,
    Izin,
    Absensi,
    Fakultas,
    Setting,
    Holiday,
    Waktu_kerja,
} = require("../db/models");

const { text_limit, capitalize } = require("../helpers/tools");

const { newUserCode } = require("../helpers/random");

const {
    convertDate,
    convertDate_1,
    hitungWaktuKerja,
    getMonthDateRange,
    parsingDate,
    LocalDates,
} = require("../helpers/date_ops");

const { db_list_server } = require("../helpers/db_ops");

const { NowOnly, enumerateDaysBetweenDates } = require("../helpers/date_ops");

const { validationResult } = require("express-validator");

const controllers = {};

controllers.index = async function (req, res, next) {
    res.render("pages/admin/auth_admin");
};



controllers.cetakPdfRekap = async function (req, res, next) {
    const param = req.params;
    var kode = param.kode;
    var startDate = param.startDate;
    var endDate = param.endDate;
    const today = moment(new Date()).format("YYYY-MM-DD");
    // Member
    var listMember = {};
    await Member.findAll({
        where: { status_active: { [Op.ne]: "nonactive" } },
    }).then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                listMember[i] = {
                    id: e.id,
                    nama: e.nama,
                    nip: e.nip,
                    jabatan: e.jabatan,
                    status: e.status,
                    jenis_kelamin: e.jenis_kelamin,
                };
                i++;
            })
        );
    });

    var sql = {};
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = ["id", "masuk", "keluar", "tanggal"];
    sql["include"] = [
        {
            required: true,
            model: Member,
            attributes: ["id", "nama", "nip", "jabatan"],
        },
    ];
    if (startDate == "-" && endDate != "-") {
        let endDates = moment(endDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.lte]: endDates,
            },
        };
    } else if (startDate != "-" && endDate == "-") {
        let startDates = moment(startDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.gte]: startDates,
                [Op.lte]: today,
            },
        };
    } else if (startDate != "-" && endDate != "-") {
        let endDates = moment(endDate).format("YYYY-MM-DD");
        let startDates = moment(startDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.gte]: startDates,
                [Op.lte]: endDates,
            },
        };
    }

    var list_absensi = {};
    await Absensi.findAll(sql).then(async (value) => {
        var j = 0;
        await Promise.all(
            value.map(async (e) => {
                var tanggal = e.tanggal;
                var member_id = e.Member.id;
                if (list_absensi[tanggal] != undefined) {
                    list_absensi[tanggal].push(member_id);
                } else {
                    list_absensi[tanggal] = [member_id];
                }
            })
        );
    });

    var listLiburMingguan = {};
    await Setting.findAll({
        attributes: ["setting_value"],
        where: {
            setting_name: "hari_libur_mingguan",
        },
    }).then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                listLiburMingguan = JSON.parse(e.setting_value);
            })
        );
    });

    var Mingguan = [];
    var i = 0;
    for (x in listLiburMingguan) {
        Mingguan[i] = await capitalize(listLiburMingguan[x]);
        i++;
    }

    var list_izin = {};
    await Izin.findAll().then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                var member_id = e.memberId;
                var status = e.status;
                var startDD = e.start_date;
                var endDD = e.end_date;
                var listDate = await enumerateDaysBetweenDates(startDD, endDD);
                if (list_izin[member_id] != undefined) {
                    if (list_izin[member_id].hasOwnProperty(status)) {
                        var tmpVV = list_izin[member_id][status];
                        list_izin[member_id][status] = tmpVV.concat(listDate);
                    } else {
                        if (Object.keys(list_izin[member_id]).length > 0) {
                            var tempVar = {
                                [status]: listDate,
                            };
                            list_izin[member_id] = {
                                ...list_izin[member_id],
                                ...tempVar,
                            };
                        } else {
                            list_izin[member_id] = { [status]: listDate };
                        }
                    }
                } else {
                    list_izin[member_id] = { [status]: listDate };
                }
            })
        );
    });

    // console.log("+++++++++++++++++Daftar ");
    // console.log(list_izin);
    // console.log("+++++++++++++++++");

    // var hari_libur = await get_hari_libur(startDate, endDate);
    let endDates = moment(endDate).format("YYYY-MM-DD");
    let startDates = moment(startDate).format("YYYY-MM-DD");

    var holiday = [];
    await Holiday.findAll({ where : { dateHoliday : { [Op.gte]: startDates, [Op.lte]: endDates, }}}).then(async (value) => {
        await Promise.all(
            value.map(async (e) => {
                if(! holiday.includes(e.dateHoliday) ) {
                    holiday.push(e.dateHoliday);
                }
            })
        );
    });


    console.log("----Holiday----");
    console.log(holiday);
    console.log("----Holiday----");


    var list_hari_kerja = await enumerateDaysBetweenDates(
        startDate,
        endDate,
        Mingguan
    );

    const daftar_hari_kerja = list_hari_kerja.filter(day => !holiday.includes(day));

    console.log("++++++++++daftar_hari_kerja");
    console.log(daftar_hari_kerja);
    console.log("++++++++++daftar_hari_kerja");

    var h = 0;
    var list = [];
    for (xi in listMember) {
        for (j in daftar_hari_kerja) {
            if (list_absensi[daftar_hari_kerja[j]] != undefined) {
                if (
                    list_absensi[daftar_hari_kerja[j]].includes(
                        listMember[xi].id
                    )
                ) {
                    // kalau masuk sini berarti melakukan absensi
                    if (list[listMember[xi].id] != undefined) {
                        // jika member id sudah terdapat didalam array list
                        if (list[listMember[xi].id]["hadir"] != undefined) {
                            list[listMember[xi].id]["hadir"] =
                                list[listMember[xi].id]["hadir"] + 1;
                        } else {
                            var temp = { hadir: 1 };
                            list[listMember[xi].id] = {
                                ...list[listMember[xi].id],
                                ...temp,
                            };
                        }
                    } else {
                        // jika member id belum terdapat didalam array list
                        list[listMember[xi].id] = {
                            nama: listMember[xi].nama,
                            nip: listMember[xi].nip,
                            jabatan: listMember[xi].jabatan,
                            status: listMember[xi].status,
                            jenis_kelamin: listMember[xi].jenis_kelamin,
                            hadir: 1,
                        };
                    }
                } else {
                    //tidak hadir
                    if (list_izin[listMember[xi].id] != undefined) {
                        // jika ada melakukan izin
                        var st = "tidak_ada";
                        for (o in list_izin[listMember[xi].id]) {
                            if (
                                list_izin[listMember[xi].id][o].includes(
                                    daftar_hari_kerja[j]
                                )
                            ) {
                                st = "ada";
                                // console.log("++++++++++++o");
                                // console.log(o);
                                // console.log(listMember[xi].id);
                                // console.log(list);
                                // console.log(typeof list[listMember[xi].id]);
                                // console.log("++++++++++++o");
                                if (
                                    list[listMember[xi].id] != undefined &&
                                    list[listMember[xi].id][o] != undefined
                                ) {
                                    list[listMember[xi].id][o] =
                                        list[listMember[xi].id][o] + 1;
                                } else {
                                    if (list[listMember[xi].id] == undefined) {
                                        list[listMember[xi].id] = {
                                            nama: listMember[xi].nama,
                                            nip: listMember[xi].nip,
                                            jabatan: listMember[xi].jabatan,
                                            status: listMember[xi].status,
                                            jenis_kelamin:
                                                listMember[xi].jenis_kelamin,
                                            [o]: 1,
                                        };
                                    } else {
                                        var temp = { [o]: 1 };
                                        list[listMember[xi].id] = {
                                            ...list[listMember[xi].id],
                                            ...temp,
                                        };
                                    }
                                    // console.log("______AAAAAAAAA______");
                                    // console.log(listMember[xi].id);
                                    // console.log(list[listMember[xi].id]);
                                    // console.log("______AAAAAAAAA______");
                                    // var temp = { [o]: 1 };
                                    // list[listMember[xi].id] = {
                                    //     ...list[listMember[xi].id],
                                    //     ...temp,
                                    // };
                                }
                            }
                        }
                        if (st == "tidak_ada") {
                            if (list[listMember[xi].id] != undefined) {
                                if (
                                    list[listMember[xi].id][
                                        "tanpa_keterangan"
                                    ] != undefined
                                ) {
                                    list[listMember[xi].id][
                                        "tanpa_keterangan"
                                    ] =
                                        list[listMember[xi].id][
                                            "tanpa_keterangan"
                                        ] + 1;
                                } else {
                                    var temp = { tanpa_keterangan: 1 };
                                    list[listMember[xi].id] = {
                                        ...list[listMember[xi].id],
                                        ...temp,
                                    };
                                }
                            } else {
                                list[listMember[xi].id] = {
                                    nama: listMember[xi].nama,
                                    nip: listMember[xi].nip,
                                    jabatan: listMember[xi].jabatan,
                                    status: listMember[xi].status,
                                    jenis_kelamin: listMember[xi].jenis_kelamin,
                                    tanpa_keterangan: 1,
                                };
                            }
                        }
                    } else {
                        if (list[listMember[xi].id] != undefined) {
                            if (
                                list[listMember[xi].id]["tanpa_keterangan"] !=
                                undefined
                            ) {
                                list[listMember[xi].id]["tanpa_keterangan"] =
                                    list[listMember[xi].id][
                                        "tanpa_keterangan"
                                    ] + 1;
                            } else {
                                var temp = { tanpa_keterangan: 1 };
                                list[listMember[xi].id] = {
                                    ...list[listMember[xi].id],
                                    ...temp,
                                };
                            }
                        } else {
                            list[listMember[xi].id] = {
                                nama: listMember[xi].nama,
                                nip: listMember[xi].nip,
                                jabatan: listMember[xi].jabatan,
                                status: listMember[xi].status,
                                jenis_kelamin: listMember[xi].jenis_kelamin,
                                tanpa_keterangan: 1,
                            };
                        }
                    }
                }
            } else {
                // jika masuk sini maka ada dua hal. kalau tidak izin, maka berarti tidak hadir tanpa ke terangan
                // check di izin
                if (list_izin[listMember[xi].id] != undefined) {
                    var st = "tidak_ada";
                    // jika ada melakukan izin
                    for (o in list_izin[listMember[xi].id]) {
                        if (
                            list_izin[listMember[xi].id][o].includes(
                                daftar_hari_kerja[j]
                            )
                        ) {
                            st = "ada";
                            if (list[listMember[xi].id][o] != undefined) {
                                list[listMember[xi].id][o] =
                                    list[listMember[xi].id][o] + 1;
                            } else {
                                if (list[listMember[xi].id] == undefined) {
                                    list[listMember[xi].id] = {
                                        nama: listMember[xi].nama,
                                        nip: listMember[xi].nip,
                                        jabatan: listMember[xi].jabatan,
                                        status: listMember[xi].status,
                                        jenis_kelamin:
                                            listMember[xi].jenis_kelamin,
                                        [o]: 1,
                                    };
                                } else {
                                    var temp = { [o]: 1 };
                                    list[listMember[xi].id] = {
                                        ...list[listMember[xi].id],
                                        ...temp,
                                    };
                                }
                            }
                        }
                    }
                    if (st == "tidak_ada") {
                        if (list[listMember[xi].id] != undefined) {
                            if (
                                list[listMember[xi].id]["tanpa_keterangan"] !=
                                undefined
                            ) {
                                list[listMember[xi].id]["tanpa_keterangan"] =
                                    list[listMember[xi].id][
                                        "tanpa_keterangan"
                                    ] + 1;
                            } else {
                                var temp = { tanpa_keterangan: 1 };
                                list[listMember[xi].id] = {
                                    ...list[listMember[xi].id],
                                    ...temp,
                                };
                            }
                        } else {
                            list[listMember[xi].id] = {
                                nama: listMember[xi].nama,
                                nip: listMember[xi].nip,
                                jabatan: listMember[xi].jabatan,
                                status: listMember[xi].status,
                                jenis_kelamin: listMember[xi].jenis_kelamin,
                                tanpa_keterangan: 1,
                            };
                        }
                    }
                } else {
                    if (list[listMember[xi].id] != undefined) {
                        if (
                            list[listMember[xi].id]["tanpa_keterangan"] !=
                            undefined
                        ) {
                            list[listMember[xi].id]["tanpa_keterangan"] =
                                list[listMember[xi].id]["tanpa_keterangan"] + 1;
                        } else {
                            var temp = { tanpa_keterangan: 1 };
                            list[listMember[xi].id] = {
                                ...list[listMember[xi].id],
                                ...temp,
                            };
                        }
                    } else {
                        list[listMember[xi].id] = {
                            nama: listMember[xi].nama,
                            nip: listMember[xi].nip,
                            jabatan: listMember[xi].jabatan,
                            status: listMember[xi].status,
                            jenis_kelamin: listMember[xi].jenis_kelamin,
                            tanpa_keterangan: 1,
                        };
                    }
                }
            }
        }
    }

    // console.log("+++++++++++++list");
    // console.log(list);
    // console.log("+++++++++++++list");

    var s = moment(startDate).format("LL");
    var e = moment(endDate).format("LL");

    res.render("pages/rekap_kwitansi", {
        list,
        start_date: s,
        end_date: e,
        jumlah_kerja: daftar_hari_kerja.length,
        tanggal: moment(new Date()).format("LL"),
    });
};

controllers.cetakPdf = async function (req, res, next) {
    const param = req.params;
    var kode = param.kode;
    var startDate = param.startDate;
    var endDate = param.endDate;
    const today = moment(new Date()).format("YYYY-MM-DD");
    // Member
    var listMember = {};
    await Member.findAll({
        where: { status_active: { [Op.ne]: "nonactive" } },
    }).then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                listMember[i] = {
                    id: e.id,
                    nama: e.nama,
                    nip: e.nip,
                    jabatan: e.jabatan,
                    status: e.status,
                    jenis_kelamin: e.jenis_kelamin,
                };
                i++;
            })
        );
    });

    var listDetailIzin = {};
    await Izin.findAll().then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                const status = e.status;
                const memberId = e.memberId;
                const listDate = await enumerateDaysBetweenDates(
                    e.start_date,
                    e.end_date
                );
                for (x in listDate) {
                    if (listDetailIzin[listDate[x]] === undefined) {
                        listDetailIzin[listDate[x]] = { [status]: [memberId] };
                    } else {
                        if (listDetailIzin[listDate[x]][status] === undefined) {
                            if (
                                Object.keys(listDetailIzin[listDate[x]])
                                    .length > 0
                            ) {
                                listDetailIzin[listDate[x]] = {
                                    ...listDetailIzin[listDate[x]],
                                    [status]: [memberId],
                                };
                            } else {
                                listDetailIzin[listDate[x]] = {
                                    [status]: [memberId],
                                };
                            }
                        } else {
                            listDetailIzin[listDate[x]][status].push(memberId);
                        }
                    }
                }
                i++;
            })
        );
    });

    // console.log("-------------------");
    // console.log(listDetailIzin);
    // console.log("-------------------");

    var sql = {};
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = ["id", "masuk", "keluar", "tanggal"];
    sql["include"] = [
        {
            required: true,
            model: Member,
            attributes: ["id", "nama", "nip", "jabatan"],
        },
    ];
    if (startDate == "-" && endDate != "-") {
        let endDates = moment(endDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.lte]: endDates,
            },
        };
    } else if (startDate != "-" && endDate == "-") {
        let startDates = moment(startDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.gte]: startDates,
                [Op.lte]: today,
            },
        };
    } else if (startDate != "-" && endDate != "-") {
        let endDates = moment(endDate).format("YYYY-MM-DD");
        let startDates = moment(startDate).format("YYYY-MM-DD");
        sql["where"] = {
            tanggal: {
                [Op.gte]: startDates,
                [Op.lte]: endDates,
            },
        };
    }

    const query = await db_list_server(sql);
    var list_absensi = {};
    var list_tanggal = [];
    await Absensi.findAll(query.sql).then(async (value) => {
        // var i = 0;
        var j = 0;
        await Promise.all(
            value.map(async (e) => {
                if (!list_tanggal.includes(e.tanggal)) {
                    list_tanggal[j] = e.tanggal;
                    j++;
                }
                list_absensi[
                    e.tanggal.toString() + "-" + e.Member.id.toString()
                ] = {
                    memberId: e.Member.id,
                    nama: e.Member.nama,
                    nip: e.Member.nip,
                    waktu_masuk: e.masuk == null ? "-" : e.masuk,
                    waktu_keluar: e.keluar == null ? "-" : e.keluar,
                    status: "hadir",
                    tanggal: e.tanggal,
                    jabatan: e.Member.jabatan,
                };
            })
        );
    });

    var list = [];
    var i = 0;
    for (x in list_tanggal) {
        for (y in listMember) {
            if (
                list_absensi[
                    list_tanggal[x].toString() +
                        "-" +
                        listMember[y].id.toString()
                ] === undefined
            ) {
                if (listDetailIzin[list_tanggal[x]] !== undefined) {
                    var izin = 0;
                    for (z in listDetailIzin[list_tanggal[x]]) {
                        if (
                            listDetailIzin[list_tanggal[x]][z].includes(
                                listMember[y].id
                            )
                        ) {
                            izin++;
                            list[i] = {
                                nama: listMember[y].nama,
                                nip: listMember[y].nip,
                                waktu_masuk: "-",
                                waktu_keluar: "-",
                                ket: z,
                                status: listMember[y].status,
                                tanggal: list_tanggal[x],
                                jabatan: listMember[y].jabatan,
                            };

                            i++;
                        }
                    }

                    if (izin == 0) {
                        list[i] = {
                            nama: listMember[y].nama,
                            nip: listMember[y].nip,
                            waktu_masuk: "-",
                            waktu_keluar: "-",
                            ket: "Tanpa Keterangan",
                            status: listMember[y].status,
                            tanggal: list_tanggal[x],
                            jabatan: listMember[y].jabatan,
                        };
                        i++;
                    }
                } else {
                    list[i] = {
                        nama: listMember[y].nama,
                        nip: listMember[y].nip,
                        waktu_masuk: "-",
                        waktu_keluar: "-",
                        ket: "tidak hadir",
                        status: listMember[y].status,
                        tanggal: list_tanggal[x],
                        jabatan: listMember[y].jabatan,
                    };
                    i++;
                }
            } else {
                list[i] = {
                    nama: listMember[y].nama,
                    nip: listMember[y].nip,
                    waktu_masuk:
                        list_absensi[
                            list_tanggal[x].toString() +
                                "-" +
                                listMember[y].id.toString()
                        ].waktu_masuk,
                    waktu_keluar:
                        list_absensi[
                            list_tanggal[x].toString() +
                                "-" +
                                listMember[y].id.toString()
                        ].waktu_keluar,
                    ket: list_absensi[
                        list_tanggal[x].toString() +
                            "-" +
                            listMember[y].id.toString()
                    ].status,
                    status: listMember[y].status,
                    tanggal: list_tanggal[x],
                    jabatan: listMember[y].jabatan,
                };
                i++;
            }
        }
    }

    var rekap = {
        hadir: 0,
        dinasluar: 0,
        izin: 0,
        cutihamil: 0,
        sakit: 0,
        "Tanpa Keterangan": 0,
    };

    console.log('_____________________');
    console.log(rekap);
    console.log('_____________________');

    for (q in list) {
        console.log('_____________________A');
        console.log(list[q].ket);
        console.log('_____________________B');
        console.log(rekap[list[q].ket]);
        console.log('_____________________C');
        if( rekap[list[q].ket] !== undefined ) {
            rekap[list[q].ket] = rekap[list[q].ket] + 1;
        }else{
            rekap['Tanpa Keterangan'] = rekap['Tanpa Keterangan'] + 1;
        }
    }

    res.render("pages/kwitansi", {
        list,
        rekap,
        tanggal: moment(new Date()).format("LL"),
    });
};

// authentication controllers
controllers.auth = async function (req, res) {
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
        const body = req.body;
        // try {
        const admin = await User.findOne({
            where: { name: body.username },
        });
        if (admin) {
            const validPassword = await bcrypt.compare(
                body.password,
                admin.password
            );

            var kode = admin.kode;

            if (!validPassword)
                return res.status(400).json("Password Tidak Valid");

            if (typeof req.session.loginAdminList !== "undefined") {
                if (!req.session.loginAdminList.includes(kode)) {
                    var list = [];
                    var i = 0;
                    req.session.loginAdminList.forEach((element) => {
                        console.log(element);
                        list[i] = element;
                        i++;
                    });
                    list[i] = kode;
                    // set session
                    req.session.loginAdminList = list;
                }
            } else {
                // set session
                req.session.loginAdminList = [kode];
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
        // } catch (error) {
        //     res.status(400).json(error);
        // }
    }
};

controllers.areaAdmin = async function (req, res) {
    const param = req.params;
    var kode = param.kode;
    var list_submenu = [];
    await Submenu.findAll().then(async (value) => {
        var z = 0;
        await Promise.all(
            await value.map(async (es) => {
                list_submenu[z] = {
                    menuId: es.menuId,
                    name: es.name,
                    path: es.path,
                };
                z++;
            })
        );
    });

    await Menu.findAll({ order: [["id", "ASC"]] }).then(async (menus) => {
        var list = {};
        var i = 0;

        await Promise.all(
            await menus.map(async (e) => {
                var submenu = {};
                var k = 0;
                await Promise.all(
                    await list_submenu.map(async (ex) => {
                        if (ex.menuId == e.id) {
                            submenu[k] = {
                                name: ex.name,
                                path: ex.path,
                            };
                            k++;
                        }
                    })
                );
                list[i] = {
                    id: e.id,
                    name: e.name,
                    path: e.path,
                    icon: e.icon,
                    submenu: submenu,
                };
                i++;
            })
        );

        var sesi = {};

        await User.findOne({
            where: { kode: kode },
        }).then(async (val) => {
            if (val) {
                sesi["kode"] = val.kode;
                sesi["name"] = val.name;
                sesi["level"] = "Administrator";
            }
        });

        res.render("pages/admin/admin", {
            kode,
            list,
            sesi,
        });
    });
};

controllers.dashboard_superadmin = async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var kode;
    var name;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        kode = decoded.kode;
    });
    if (kode != null) {
        // get name from user
        await User.findOne({
            where: { kode: kode },
        }).then(async (val) => {
            if (val) {
                name = val.name;
            }
        });
    }
    // get total member
    const q_total_member = await Member.findAndCountAll();
    const total_member = q_total_member.count;

    // get total izin
    const q_total_izin = await Izin.findAndCountAll({
        where: { end_date: { [Op.gte]: new Date() } },
    });
    const total_izin = q_total_izin.count;
    // response
    res.status(200).json({
        data: {
            total_member: total_member,
            total_izin: total_izin,
            name: name,
        },
    });
};

controllers.riwayatAbsensiHariIni = async (req, res) => {
    const body = req.body;
    var search = "";
    if (body.search != undefined && body.search != "") search = body.search;
    var limit = body.perpage;
    var page = 1;
    if (body.pageNumber != undefined) page = body.pageNumber;
    // const n = await LocalDates();

    const today = moment(new Date()).format("YYYY-MM-DD");

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = ["id", "masuk", "keluar", "tanggal"];
    sql["include"] = [
        {
            required: true,
            model: Member,
            attributes: ["nama", "nip"],
            where: {
                [Op.or]: {
                    nama: {
                        [Op.like]: "%" + search + "%",
                    },
                    nip: {
                        [Op.like]: "%" + search + "%",
                    },
                },
            },
        },
    ];
    sql["where"] = {
        [Op.and]: {
            tanggal: {
                [Op.like]: today,
            },
        },
    };

    const query = await db_list_server(sql);
    const q_total = await Absensi.findAndCountAll(query.total);
    const total = q_total.count;
    var list = {};
    if (total > 0) {
        await Absensi.findAll(query.sql).then(async (value) => {
            var i = 0;
            await Promise.all(
                value.map(async (e) => {
                    var totalKerja = await hitungWaktuKerja(
                        e.tanggal,
                        e.masuk,
                        e.keluar
                    );
                    list[i] = {
                        id: e.id,
                        fullname: e.Member.nama,
                        nip: e.Member.nip,
                        masuk: e.masuk,
                        keluar: e.keluar,
                        tanggal: e.tanggal,
                        total_kerja: totalKerja,
                    };

                    i++;
                })
            );

            res.status(200).json({
                data: list,
                total: total,
            });
        });
    } else {
        res.status(200).json({
            data: list,
            total: total,
        });
    }
};

// update profil controller
controllers.updateProfil = async (req, res) => {
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
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        var kode;
        var name;

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            kode = decoded.kode;
        });

        if (kode != null) {
            // get name from user
            await User.findOne({
                where: { kode: kode },
            }).then(async (val) => {
                if (val) {
                    name = val.name;
                }
            });
        }

        const body = req.body;
        var err = false;
        var msg = "";
        var data = {};
        // check password baru
        if (body.pass_baru != "") {
            // check jika password baru tidak kosong
            if (body.konf_pass_baru != "") {
                if (body.konf_pass_baru == body.pass_baru) {
                    const admin = await User.findOne({
                        where: {
                            kode: kode,
                        },
                    });
                    if (admin) {
                        const validPassword = await bcrypt.compare(
                            body.pass_lama,
                            admin.password
                        );
                        // check validation feedBack
                        if (validPassword) {
                            const saltRounds = 10;
                            await bcrypt
                                .genSalt(saltRounds)
                                .then((salt) => {
                                    return bcrypt.hash(body.pass_baru, salt);
                                })
                                .then(async (hash) => {
                                    data["name"] = body.username;
                                    data["password"] = hash;

                                    await User.update(data, {
                                        where: { kode: kode },
                                    }).then(async (value) => {
                                        err = false;
                                        msg = "Update berhasil.";
                                    });
                                })
                                .catch((err) => {
                                    err = true;
                                    msg =
                                        "Proses hash password gagal dilakukan.";
                                });
                        } else {
                            err = true;
                            msg = "Password tidak valid.";
                        }
                    }
                } else {
                    err = true;
                    msg =
                        "Password konfirmasi tidak sama dengan password baru.";
                }
            } else {
                err = true;
                msg = "Password konfirmasi wajib diisi.";
            }
            // filter error
            if (err == true) {
                res.status(400).json("Proses logout berhasil");
            } else {
                res.status(200).json({ msg: msg });
            }
        } else {
            data["name"] = body.username;
            data["updatedAt"] = new Date();
            const update = await User.update(data, {
                where: { kode: kode },
            });
            // update process
            if (!update) {
                res.status(400).json("Proses update profil gagal dilakukan.");
            } else {
                // proses update
                res.status(200).json({
                    msg: "Proses update profil berhasil dilakukan.",
                });
            }
        }
    }
};

controllers.getInfoProfil = async function (req, res) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var kode;

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        kode = decoded.kode;
    });

    try {
        const user = await User.findOne({
            where: { kode: kode },
        });
        if (user) {
            res.status(200).json({
                data: {
                    level: user.level,
                    name: user.name,
                },
                error: "Berhasil",
            });
        } else {
            res.status(400).json({ error_msg: "Info admin tidak ditemukan" });
        }
    } catch (error) {
        res.status(400).json({ error_msg: "Info admin tidak ditemukan" });
    }
};

// controllers.sinkronisasiDataDosen = async (req, res) => {
//     const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

//     var fakultas = {};
//     await Fakultas.findAll().then(async (e) => {
//         if (e) {
//             var i = 0;
//             await Promise.all(
//                 await e.map(async (em) => {
//                     fakultas[i] = {
//                         id: em.id,
//                         name: "FAKULTAS " + em.name.toUpperCase(),
//                     };
//                     i++;
//                 })
//             );
//         }
//     });

//     const q_total_member = await Member.findAndCountAll();
//     const total_member = q_total_member.count;
//     var url = "https://sdm.unsam.ac.id/user_federation/getAllUser";
//     var j = 0;

//     new Promise((resolve, reject) => {
//         request(
//             {
//                 method: "POST",
//                 uri: url,
//                 json: true,
//                 body: { key: "e5bb4999-6359-4036-b706-7cb4f9585e62" },
//             },
//             async function (error, response, body) {
//                 if (!error && response.statusCode == 200) {
//                     await Promise.all(
//                         await body.map(async (e) => {
//                             if (e.roles == "lecture") {
//                                 if ("attributes" in e) {
//                                     var fakultas_name =
//                                         e.attributes.unit_kerja[0];
//                                     var nama = e.attributes.nama_dosen[0];
//                                     var nip = e.attributes.nip[0];

//                                     var data = {};
//                                     data["username"] = nip;
//                                     data["fullname"] = nama;
//                                     Object.keys(fakultas).forEach(function (
//                                         key,
//                                         index
//                                     ) {
//                                         if (
//                                             fakultas[key].name == fakultas_name
//                                         ) {
//                                             data["fakultas_id"] =
//                                                 fakultas[key].id;
//                                         }
//                                     });
//                                     data["nip"] = nip;
//                                     data["updatedAt"] = myDate;
//                                     await Member.count({
//                                         where: { nip: nip },
//                                     }).then(async (total_m) => {
//                                         if (total_m == 0) {
//                                             data["createdAt"] = myDate;
//                                             await Member.create(data);
//                                         } else {
//                                             await sequelize.query(
//                                                 `DELETE S1 FROM Members AS S1
//                                                     INNER JOIN Members AS S2
//                                                     WHERE S1.id < S2.id AND S1.nip = S2.nip`
//                                             );
//                                             if (total_m == 1) {
//                                                 // update process
//                                                 await Member.update(data, {
//                                                     where: { nip: nip },
//                                                 });
//                                             }
//                                         }
//                                     });
//                                 }
//                             }
//                         })
//                     );

//                     res.status(200).json({
//                         msg: "Proses sinkronisasi berhasil dilakukan.",
//                     });
//                 } else {
//                     var json = JSON.parse(body);
//                     // return
//                     res.status(401).json({
//                         msg: json.messages.error,
//                     });
//                 }
//             }
//         );
//     });
// };

// // daftar dosen
// controllers.daftarGuruTendik = async (req, res) => {
//     const body = req.body;
//     var search = "";
//     var limit = body.perpage;
//     var page = 1;
//     if (body.pageNumber != undefined) page = body.pageNumber;

//     var sql = {};
//     sql["limit"] = limit * 1;
//     sql["offset"] = (page - 1) * limit;
//     sql["order"] = [["id", "DESC"]];
//     sql["attributes"] = [
//         "id",
//         "nama",
//         "nip",
//         "username",
//         "jabatan",
//         "status",
//         "jenis_kelamin",
//     ];

//     if (body.search != undefined && body.search != "") {
//         search = body.search;
//         sql["where"] = {
//             [Op.or]: {
//                 nip: { [Op.like]: "%" + search + "%" },
//                 fullname: { [Op.like]: "%" + search + "%" },
//             },
//         };
//     }

//     const query = await db_list_server(sql);
//     const q_total = await Member.findAndCountAll(query.total);
//     const total = await q_total.count;
//     var list = {};
//     if (total > 0) {
//         await Member.findAll(query.sql).then(async (value) => {
//             var i = 0;
//             await Promise.all(
//                 value.map(async (e) => {
//                     list[i] = {
//                         id: e.id,
//                         fullname: e.nama,
//                         nip: e.nip,
//                         username: e.username,
//                         status: e.status,
//                         jabatan: e.jabatan,
//                         jenis_kelamin: e.jenis_kelamin,
//                     };

//                     i++;
//                 })
//             );

//             res.status(200).json({
//                 data: list,
//                 total: total,
//             });
//         });
//     } else {
//         res.status(200).json({
//             data: list,
//             total: total,
//         });
//     }
// };

async function hitKerjaHariIni(nip) {
    const n = await LocalDates();

    var sql = {};
    sql["attributes"] = ["masuk", "keluar", "tanggal"];
    sql["where"] = {
        [Op.and]: {
            tanggal: {
                [Op.like]: n.dateDash,
            },
            nip: nip,
        },
    };

    const query = await db_list_server(sql);
    const q_total = await Absensi.findAndCountAll(query.total);
    const total = await q_total.count;
    var total_kerja = "00hr00min";
    if (total > 0) {
        await Absensi.findOne(query.sql).then(async (value) => {
            if (value) {
                total_kerja = await hitungWaktuKerja(
                    value.tanggal,
                    value.masuk,
                    value.keluar
                );
            }
        });
    }

    return total_kerja;
}

controllers.daftarPengguna = async (req, res) => {
    const errors = validationResult(req);

    const param = req.params;
    var kode = param.kode;

    await User.findOne({
        where: { kode: kode },
    }).then(async (val) => {
        if (val) {
            if (val.level == "superadmin") {
                if (!errors.isEmpty()) {
                    // filter
                    var err_msg = "";
                    let num = 0;
                    errors.array().forEach((error) => {
                        if (num != 0) err_msg += "<br>";
                        err_msg += error.msg;
                        num++;
                    });
                    res.status(400).json({ msg: err_msg });
                } else {
                    const body = req.body;
                    var search = "";
                    var limit = body.perpage;
                    var page = 1;
                    if (body.pageNumber != undefined) page = body.pageNumber;

                    var sql = {};
                    sql["limit"] = limit * 1;
                    sql["offset"] = (page - 1) * limit;
                    sql["order"] = [["id", "DESC"]];
                    sql["attributes"] = [
                        "id",
                        "kode",
                        "name",
                        "level",
                        "updatedAt",
                    ];
                    sql["include"] = {
                        required: false,
                        model: Fakultas,
                        attributes: ["name"],
                    };

                    if (body.search != undefined && body.search != "") {
                        search = body.search;
                        sql["where"] = {
                            name: "%" + search + "%",
                        };
                    }

                    const query = await db_list_server(sql);
                    const q_total = await User.findAndCountAll(query.total);
                    const total = await q_total.count;
                    var list = {};
                    if (total > 0) {
                        var list = {};

                        await User.findAll(query.sql).then(async (value) => {
                            var i = 0;
                            await Promise.all(
                                value.map(async (e) => {
                                    list[i] = {
                                        id: e.id,
                                        kode: e.kode,
                                        name: e.name,
                                        level: e.level,
                                        fakultas:
                                            e.Fakulta != null
                                                ? e.Fakulta.name
                                                : "Tidak Ditemukan",
                                        pembaharuan: e.updatedAt,
                                    };
                                    i++;
                                })
                            );

                            res.status(200).json({
                                data: list,
                                total: total,
                            });
                        });
                    } else {
                        res.status(200).json({
                            data: list,
                            total: total,
                        });
                    }
                }
            } else {
                res.status(400).json({
                    msg: "Anda tidak berhak untuk mengakses halaman ini.",
                });
            }
        } else {
            res.status(400).json({
                msg: "Anda tidak berhak untuk mengakses halaman ini.",
            });
        }
    });
};

controllers.getKodePengguna = async (req, res) => {
    const kode = await newUserCode();
    var list = {};
    await Fakultas.findAll().then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                list[i] = {
                    id: e.id,
                    name: e.name,
                };
                i++;
            })
        );
    });
    res.status(200).json({
        data: { list: list, kode: kode },
    });
};

controllers.getListFakultas = async (req, res) => {
    var list = {};
    await Fakultas.findAll().then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                list[i] = {
                    id: e.id,
                    name: e.name,
                };
                i++;
            })
        );
    });
    res.status(200).json({
        data: list,
    });
};

// menambahkan daftar pengguna baru
controllers.addPengguna = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var body = req.body;
        var err = false;
        var msg = "";

        const saltRounds = 10;
        await bcrypt
            .genSalt(saltRounds)
            .then((salt) => {
                return bcrypt.hash(body.password, salt);
            })
            .then(async (hash) => {
                console.log("proses input ----->");
                console.log(body.level);
                // administrator_fakultas
                // administrator_biro
                console.log("proses input ----->");
                var data = {};
                data["kode"] = body.kode;
                data["name"] = body.username;
                data["level"] = body.level;
                data["password"] = hash;
                if (body.fakultas != 0) {
                    data["fakultas_id"] = body.fakultas;
                }
                data["createdAt"] = myDate;
                data["updatedAt"] = myDate;
                // create
                const insert = await User.create(data);
                // process
                if (!insert) {
                    err = true;
                    msg = "Proses penambahan pengguna baru gagal dilakukan.";
                }
            })
            .catch((err) => {
                err = true;
                msg = "Proses hash password gagal dilakukan.";
            });

        // mengembalikan feedback kepada frontend
        if (err == false) {
            res.status(200).json({
                msg: "Proses penambahan pengguna baru berhasil dilakukan.",
            });
        } else {
            res.status(400).json({
                msg: msg,
            });
        }
    }
};

// hapus pengguna
controllers.hapusPengguna = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        var body = req.body;
        // proses delete data di database
        const deleteUser = await User.destroy({
            where: {
                id: body.id,
            },
        });
        // check pengguna
        if (!deleteUser) {
            res.status(400).json({
                msg: "Proses hapus pengguna gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Proses hapus pengguna berhasil dilakukan.",
            });
        }
    }
};

// get info edit pengguna
controllers.getInfoEditPengguna = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        var body = req.body;

        var listFakultas = {};
        await Fakultas.findAll().then(async (value) => {
            var i = 0;
            await Promise.all(
                value.map(async (e) => {
                    listFakultas[i] = {
                        id: e.id,
                        name: e.name,
                    };
                    i++;
                })
            );
        });

        await User.findOne({
            attributes: ["id", "kode", "name", "level", "fakultas_id"],
            where: {
                id: body.id,
            },
        }).then((e) => {
            if (e) {
                var value = {};
                value["id"] = e.id;
                value["kode"] = e.kode;
                value["name"] = e.name;
                value["level"] = e.level;
                value["fakultas_id"] = e.fakultas_id;

                res.status(200).json({
                    data: { fakultas: listFakultas },
                    value: value,
                });
            } else {
                res.status(400).json({
                    msg: "Data tidak terdapat dipangkalan data.",
                });
            }
        });
    }
};

controllers.updatePengguna = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var body = req.body;
        var err = false;
        var msg = "";

        const saltRounds = 10;
        await bcrypt
            .genSalt(saltRounds)
            .then((salt) => {
                return bcrypt.hash(body.password, salt);
            })
            .then(async (hash) => {
                var data = {};
                data["kode"] = body.kode;
                data["name"] = body.username;
                data["level"] = body.level;
                if (body.password != "") {
                    data["password"] = hash;
                }
                if (body.level == "administrator_fakultas") {
                    data["fakultas_id"] = body.fakultas;
                } else {
                    data["fakultas_id"] = null;
                }
                data["updatedAt"] = myDate;
                const update = await User.update(data, {
                    where: { id: body.id },
                });
                // process
                if (!update) {
                    err = true;
                    msg = "Proses pembaharuan data pengguna gagal dilakukan.";
                }
            })
            .catch((err) => {
                err = true;
                msg = "Proses hash password gagal dilakukan.";
            });

        // mengembalikan feedback kepada frontend
        if (err == false) {
            res.status(200).json({
                msg: "Proses pembaharuan data pengguna berhasil dilakukan.",
            });
        } else {
            res.status(400).json({
                msg: msg,
            });
        }
    }
};

controllers.getInfoPengaturanUmum = async (req, res) => {
    var list = {};
    await Setting.findAll().then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                list[e.setting_name] =
                    e.setting_name == "hari_libur_mingguan"
                        ? e.setting_value
                        : e.setting_value;
            })
        );
    });
    res.status(200).json({
        data: list,
    });
};

controllers.simpanPerubahanPengaturan = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var body = req.body;
        var err = false;
        var dt = {};
        if (body.checkSenin) {
            dt[body.checkSenin] = body.checkSenin;
        }
        if (body.checkSelasa) {
            dt[body.checkSelasa] = body.checkSelasa;
        }
        if (body.checkRabu) {
            dt[body.checkRabu] = body.checkRabu;
        }
        if (body.checkKamis) {
            dt[body.checkKamis] = body.checkKamis;
        }
        if (body.checkJumat) {
            dt[body.checkJumat] = body.checkJumat;
        }
        if (body.checkSabtu) {
            dt[body.checkSabtu] = body.checkSabtu;
        }
        if (body.checkMinggu) {
            dt[body.checkMinggu] = body.checkMinggu;
        }
        var loop = {};
        loop[0] = { name: "nama_aplikasi", value: body.nama_aplikasi };
        loop[1] = { name: "nama_sekolah", value: body.nama_sekolah };
        loop[2] = {
            name: "nama_kepala_sekolah",
            value: body.nama_kepala_sekolah,
        };
        loop[3] = {
            name: "nip_kepala_sekolah",
            value: body.nip_kepala_sekolah,
        };
        loop[4] = {
            name: "mulai_absensi_masuk",
            value: body.mulai_absensi_masuk,
        };
        loop[5] = {
            name: "akhir_absensi_masuk",
            value: body.akhir_absensi_masuk,
        };
        loop[6] = {
            name: "mulai_absensi_keluar",
            value: body.mulai_absensi_keluar,
        };
        loop[7] = {
            name: "akhir_absensi_keluar",
            value: body.akhir_absensi_keluar,
        };
        loop[8] = {
            name: "hari_libur_mingguan",
            value: JSON.stringify(dt),
        };
        loop[9] = {
            name: "letitude",
            value: body.letitude,
        };
        loop[10] = {
            name: "longitude",
            value: body.longitude,
        };
        loop[11] = {
            name: "jarak",
            value: body.jarak,
        };
        loop[12] = {
            name: "jam_kerja",
            value: body.jam_kerja,
        };

        for (const key in loop) {
            var data = {};
            data["setting_value"] = loop[key].value;
            data["updatedAt"] = myDate;
            var update = await Setting.update(data, {
                where: { setting_name: loop[key].name },
            });
            if (!update) {
                err = true;
            }
        }
        if (err == false) {
            res.status(200).json({
                msg: "Proses pembaharuan data pengaturan umum berhasil dilakukan.",
            });
        } else {
            res.status(400).json({
                msg: msg,
            });
        }
    }
};

controllers.daftarWaktuKerja = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const body = req.body;
        var search = "";
        const limit = body.perpage;
        var page = 1;
        if (body.pageNumber != undefined) page = body.pageNumber;

        var sql = {};
        sql["limit"] = limit * 1;
        sql["offset"] = (page - 1) * limit;
        sql["order"] = [["id", "ASC"]];
        sql["attributes"] = [
            "id",
            "hari",
            "mulai_absensi_masuk",
            "akhir_absensi_masuk",
            "mulai_absensi_keluar",
            "akhir_absensi_keluar",
        ];

        if (body.search != undefined && body.search != "") {
            search = body.search;
            sql["where"] = {
                [Op.or]: {
                    nip: { [Op.like]: "%" + search + "%" },
                    nama: { [Op.like]: "%" + search + "%" },
                },
            };
        }

        const query = await db_list_server(sql);
        const q_total = await Waktu_kerja.findAndCountAll(query.total);
        const total = await q_total.count;
        var list = {};
        if (total > 0) {
            await Waktu_kerja.findAll(query.sql).then(async (value) => {
                var i = 0;
                await Promise.all(
                    value.map(async (e) => {
                        list[i] = {
                            id: e.id,
                            hari: e.hari,
                            mulai_absensi_masuk: e.mulai_absensi_masuk,
                            akhir_absensi_masuk: e.akhir_absensi_masuk,
                            mulai_absensi_keluar: e.mulai_absensi_keluar,
                            akhir_absensi_keluar: e.akhir_absensi_keluar,
                        };
                        i++;
                    })
                );

                res.status(200).json({
                    data: list,
                    total: total,
                });
            });
        } else {
            res.status(200).json({
                data: list,
                total: total,
            });
        }
    }
};

controllers.info_edit_waktu_kerja = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const body = req.body;
        const id = body.id;
        try {
            const waktuKerja = await Waktu_kerja.findOne({
                where: { id: id },
            });
            res.status(200).json({
                data: {
                    id: id,
                    hari: waktuKerja.hari,
                    mulai_absensi_masuk: waktuKerja.mulai_absensi_masuk,
                    akhir_absensi_masuk: waktuKerja.akhir_absensi_masuk,
                    mulai_absensi_keluar: waktuKerja.mulai_absensi_keluar,
                    akhir_absensi_keluar: waktuKerja.akhir_absensi_keluar,
                },
                msg: "Berhasil",
            });
        } catch (error) {
            res.status(400).json({ msg: error });
        }
    }
};

controllers.update_waktu_kerja = async (req, res) => {
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
        console.log(err_msg);
        res.status(400).json({ msg: err_msg });
    } else {
        const body = req.body;
        const id = body.id;
        const mulai_absensi_masuk = body.mulai_absensi_masuk;
        const akhir_absensi_masuk = body.akhir_absensi_masuk;
        const mulai_absensi_keluar = body.mulai_absensi_keluar;
        const akhir_absensi_keluar = body.akhir_absensi_keluar;
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        var data = [];
        data["mulai_absensi_masuk"] = mulai_absensi_masuk;
        data["akhir_absensi_masuk"] = akhir_absensi_masuk;
        data["mulai_absensi_keluar"] = mulai_absensi_keluar;
        data["akhir_absensi_keluar"] = akhir_absensi_keluar;
        data["updatedAt"] = myDate;

        console.log("________________________");
        console.log(data);
        console.log("________________________");

        // update waktu kerja
        try {
            await Waktu_kerja.update(data, {
                where: { id: id },
            });
            // response
            res.status(200).json({
                msg: "Berhasil",
            });
        } catch (error) {
            //response
            res.status(400).json({ msg: error });
        }
    }
};

module.exports = controllers;
