const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
const moment = require("moment");
const {
    Op,
    sequelize,
    // Menu,
    // Submenu,
    // User,
    Member,
    Absensi,
    // Fakultas,
    // Holiday,
} = require("../../db/models");

const { text_limit } = require("../../helpers/tools");

const { newUserCode } = require("../../helpers/random");

const {
    convertDate,
    convertDate_1,
    hitungWaktuKerja,
    getMonthDateRange,
    parsingDate,
    LocalDates,
} = require("../../helpers/date_ops");

const { db_list_server } = require("../../helpers/db_ops");

const { NowOnly } = require("../../helpers/date_ops");

const { validationResult } = require("express-validator");

const controllers = {};

// riwayat absensi dosen
controllers.riwayatAbsensi = async (req, res) => {
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

        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var filter = false;

        var limit = body.perpage;
        var page = 1;
        if (body.pageNumber != undefined) page = body.pageNumber;
        if (body.search != undefined && body.search != "") search = body.search;
        if (body.bulan != undefined && body.bulan != 0) {
            var month = body.bulan;
            if (body.tahun != undefined && body.tahun != 0) {
                year = body.tahun;
            }
            filter = true;
        } else {
            if (body.tahun != undefined && body.tahun != 0) {
                year = body.tahun;
                filter = true;
            }
        }

        var sql = {};
        sql["limit"] = limit * 1;
        sql["offset"] = (page - 1) * limit;
        sql["order"] = [["createdAt", "DESC"]];
        sql["attributes"] = ["id", "masuk", "keluar", "tanggal", "ip"];
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

        if (filter == true) {
            var start_end_date = await getMonthDateRange(year, month);
            sql["where"] = {
                tanggal: {
                    [Op.gte]: start_end_date.start_date,
                    [Op.lt]: start_end_date.end_date,
                },
            };
        }

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
                            ip: e.ip,
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

controllers.getInfoAddAbsensi = async (req, res) => {
    var sql = {};
    sql["order"] = [["createdAt", "DESC"]];
    sql["attributes"] = ["id", "nip", "nama"];

    const query = await db_list_server(sql);

    var member_list = {};
    await Member.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
            value.map(async (e) => {
                member_list[i] = {
                    id: e.id,
                    fullname: e.nama,
                    nip: e.nip,
                };
                i++;
            })
        );
    });

    res.status(200).json({
        data: { member_list: member_list },
    });
};

controllers.addAbsensiGuruTendik = async (req, res) => {
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
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const body = req.body;
        await Member.findOne({ where: { id: body.guru_tendik } }).then(
            async (value) => {
                if (value) {
                    const data = {};
                    data["memberId"] = body.guru_tendik;
                    data["tanggal"] = body.tanggal;
                    data["masuk"] = body.waktu_masuk;
                    data["keluar"] = body.waktu_keluar;
                    data["createdAt"] = myDate;
                    data["updatedAt"] = myDate;
                    // insert
                    const insert = await Absensi.create(data);
                    // process
                    if (!insert) {
                        console.log("-----------6");
                        res.status(400).json({
                            msg: "Absensi guru & tendik gagal ditambahkan.",
                        });
                    } else {
                        res.status(200).json({
                            msg: "Absensi guru & tendik berhasil ditambahkan.",
                        });
                    }
                } else {
                    res.status(400).json({
                        msg: "ID guru & tendik tidak ditemukan.",
                    });
                }
            }
        );
    }
};

// delete absensi
controllers.deleteAbsensi = async (req, res) => {
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
        const body = req.body; // delete absensi
        const deleteAbsensi = await Absensi.destroy({
            where: {
                id: body.id,
            },
        });
        if (!deleteAbsensi) {
            res.status(400).json({
                msg: "Delete absensi gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Delete absensi berhasil dilakukan.",
            });
        }
    }
};

// get info edit absensi dosen
controllers.getInfoEditAbsensi = async (req, res) => {
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
        const body = req.body; // delete absensi

        var sql = {};
        sql["order"] = [["createdAt", "DESC"]];
        sql["attributes"] = ["id", "nip", "nama"];

        const query = await db_list_server(sql);

        var member_list = {};
        await Member.findAll(query.sql).then(async (value) => {
            var i = 0;
            await Promise.all(
                value.map(async (e) => {
                    member_list[i] = {
                        id: e.id,
                        fullname: e.nama,
                        nip: e.nip,
                    };

                    i++;
                })
            );
        });

        await Absensi.findOne({
            attributes: ["tanggal", "masuk", "keluar", "id"],
            include: [
                {
                    required: true,
                    model: Member,
                    attributes: ["id"],
                },
            ],
            where: {
                id: body.id,
            },
        }).then((e) => {
            if (e) {
                var value = {};
                value["id"] = e.id;
                value["guru_tendik"] = e.Member.id;
                value["tanggal"] = e.tanggal;
                value["masuk"] = e.masuk;
                value["keluar"] = e.keluar;

                res.status(200).json({
                    data: { member_list: member_list },
                    value: value,
                });
            } else {
                res.status(400).json({
                    msg: "ID absensi tidak ditemukan",
                });
            }
        });
    }
};

controllers.updateAbsensi = async (req, res) => {
    const errors = validationResult(req);
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
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const body = req.body; // delete absensi
        var data = {};
        data["memberId"] = body.guru_tendik;
        data["tanggal"] = body.tanggal;
        data["masuk"] = body.waktu_masuk;
        data["keluar"] = body.waktu_keluar;
        data["updatedAt"] = myDate;
        // update process
        const update = await Absensi.update(data, {
            where: { id: body.id },
        });
        // feedBack
        if (!update) {
            res.status(400).json({
                msg: "Proses update data absensi gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Proses update data absensi berhasil dilakukan.",
            });
        }
    }
};

module.exports = controllers;
