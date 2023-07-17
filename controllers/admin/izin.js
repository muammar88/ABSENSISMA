const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
//import moment from "moment";
const moment = require("moment");
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
    Holiday,
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

controllers.daftarIzin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
        var limit = body.perpage;
        var page = 1;
        if (body.pageNumber != undefined) page = body.pageNumber;
        if (body.search != undefined && body.search != "") search = body.search;

        var sql = {};
        sql["limit"] = limit * 1;
        sql["offset"] = (page - 1) * limit;
        sql["order"] = [["createdAt", "DESC"]];
        sql["attributes"] = ["id", "start_date", "end_date", "status"];
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

        const query = await db_list_server(sql);
        const q_total = await Izin.findAndCountAll(query.total);
        const total = q_total.count;
        var list = {};
        if (total > 0) {
            await Izin.findAll(query.sql).then(async (value) => {
                var i = 0;
                await Promise.all(
                    value.map(async (e) => {
                        var sDate = await parsingDate(e.start_date);
                        var eDate = await parsingDate(e.end_date);

                        list[i] = {
                            id: e.id,
                            fullname: e.Member.nama,
                            nip: e.Member.nip,
                            start_date:
                                sDate.year +
                                "-" +
                                sDate.month +
                                "-" +
                                sDate.day,
                            end_date:
                                eDate.year +
                                "-" +
                                eDate.month +
                                "-" +
                                eDate.day,
                            status: e.status,
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

controllers.addizin = async (req, res) => {
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
        myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const body = req.body;
        // member
        await Member.findOne({ where: { id: body.guru_tendik } }).then(
            async (e) => {
                if (e) {
                    const data = {};
                    data["memberId"] = body.guru_tendik;
                    data["start_date"] = body.tanggal_mulai;
                    data["end_date"] = body.tanggal_akhir;
                    data["status"] = body.status;
                    data["createdAt"] = myDate;
                    data["updatedAt"] = myDate;
                    const insert = await Izin.create(data);
                    if (!insert) {
                        res.status(400).json({
                            msg: "Proses pengajuan izin gagal dilakukan.",
                        });
                    } else {
                        res.status(200).json({
                            msg: "Proses pengajuan izin berhasil dilakukan.",
                        });
                    }
                } else {
                    res.status(200).json({
                        msg: "Proses pengajuan izin berhasil dilakukan.",
                    });
                }
            }
        );
    }
};

// update izin
controllers.updateIzin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var err_msg = "";
        let num = 0;
        errors.array().forEach((error) => {
            if (num != 0) err_msg += "<br>";
            err_msg += error.msg;
            num++;
        });
        res.status(400).json({ msg: err_msg });
    } else {
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var body = req.body;
        const data = {};
        data["memberId"] = body.guru_tendik;
        data["start_date"] = body.tanggal_mulai;
        data["end_date"] = body.tanggal_akhir;
        data["status"] = body.status;
        data["updatedAt"] = myDate;
        var update = await Izin.update(data, {
            where: { id: body.id },
        });
        if (!update) {
            res.status(400).json({
                msg: "Proses update izin gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Proses update izin berhasil dilakukan.",
            });
        }
    }
};

controllers.deleteIzin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
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
        try {
            await Izin.destroy({
                where: {
                    id: body.id,
                },
            });
            res.status(200).json({
                error: false,
                error_msg: "Proses delete izin berhasil dilakukan",
            });
        } catch (error) {
            res.status(400).json({
                error: true,
                error_msg: "Proses delete izin gagal dilakukan",
            });
        }
    }
};

controllers.getInfoEditIzin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        var err_msg = "";
        let num = 0;
        errors.array().forEach((error) => {
            if (num != 0) err_msg += "<br>";
            err_msg += error.msg;
            num++;
        });
        res.status(400).json({ msg: err_msg });
    } else {
        var body = req.body;

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

        await Izin.findOne({
            attributes: ["id", "start_date", "end_date", "status"],
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
        }).then(async (e) => {
            if (e) {
                var sDate = await parsingDate(e.start_date);
                var eDate = await parsingDate(e.end_date);
                var value = {};
                value["id"] = e.id;
                value["guru_tendik"] = e.Member.id;
                value["start_date"] =
                    sDate.year + "-" + sDate.month + "-" + sDate.day;
                value["end_date"] =
                    eDate.year + "-" + eDate.month + "-" + eDate.day;
                value["status"] = e.status;
                res.status(200).json({
                    data: { member_list: member_list },
                    value: value,
                });
            } else {
                res.status(400).json({
                    msg: "ID Izin tidak ditemukan.",
                });
            }
        });
    }
};

module.exports = controllers;
