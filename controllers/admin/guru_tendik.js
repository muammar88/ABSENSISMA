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
    Menu,
    Submenu,
    User,
    Member,
    DinasLuar,
    Absensi,
    Fakultas,
    Holiday,
} = require("../../db/models");

const { text_limit } = require("../../helpers/tools");

const { newMemberCode } = require("../../helpers/random");

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

// daftar dosen
controllers.daftarGuruTendik = async (req, res) => {
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
        var limit = body.perpage;
        var page = 1;
        if (body.pageNumber != undefined) page = body.pageNumber;

        var sql = {};
        sql["limit"] = limit * 1;
        sql["offset"] = (page - 1) * limit;
        sql["order"] = [["id", "DESC"]];
        sql["attributes"] = [
            "id",
            "nama",
            "nip",
            "username",
            "jabatan",
            "status",
            "jenis_kelamin",
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
        const q_total = await Member.findAndCountAll(query.total);
        const total = await q_total.count;
        var list = {};
        if (total > 0) {
            await Member.findAll(query.sql).then(async (value) => {
                var i = 0;
                await Promise.all(
                    value.map(async (e) => {
                        list[i] = {
                            id: e.id,
                            fullname: e.nama,
                            nip: e.nip,
                            username: e.username,
                            status: e.status,
                            jabatan: e.jabatan,
                            jenis_kelamin: e.jenis_kelamin,
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

controllers.addNewGuruTendik = async (req, res) => {
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
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const saltRounds = 10;
        await bcrypt
            .genSalt(saltRounds)
            .then((salt) => {
                return bcrypt.hash(body.password, salt);
            })
            .then(async (hash) => {
                var data = {};

                var newCode = await newMemberCode();

                data["kode"] = newCode;
                data["nama"] = body.nama;
                data["nip"] = body.nip;
                data["username"] = body.username;
                data["password"] = hash;
                data["jabatan"] = body.jabatan;
                data["status"] = body.status;
                data["jenis_kelamin"] = body.jenis_kelamin;
                data["createdAt"] = myDate;
                data["updatedAt"] = myDate;
                // insert
                const insert = await Member.create(data);
                // process
                if (!insert) {
                    res.status(400).json({
                        msg: "Absensi dosen gagal ditambahkan.",
                    });
                } else {
                    res.status(200).json({
                        msg: "Absensi dosen berhasil ditambahkan.",
                    });
                }
            })
            .catch((err) => {
                res.status(400).json({
                    msg: err,
                });
            });
    }
};

controllers.updateGuruTendik = async (req, res) => {
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
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        const saltRounds = 10;
        var data = {};
        data["nama"] = body.nama;
        data["nip"] = body.nip;
        data["username"] = body.username;
        if (body.id != undefined) {
            var hash = await bcrypt.genSalt(saltRounds).then((salt) => {
                return bcrypt.hash(body.password, salt);
            });
            data["password"] = hash;
        }
        data["jabatan"] = body.jabatan;
        data["status"] = body.status;
        data["jenis_kelamin"] = body.jenis_kelamin;
        data["updatedAt"] = myDate;
        // update process
        const update = await Member.update(data, {
            where: { id: body.id },
        });
        // feedBack
        if (!update) {
            res.status(400).json(
                "Proses update data guru & tendik gagal dilakukan."
            );
        } else {
            res.status(200).json({
                msg: "Proses update data guru & tendik berhasil dilakukan.",
            });
        }
    }
};

controllers.deleteGuruTendik = async (req, res) => {
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
        const deleteMember = await Member.destroy({
            where: {
                id: body.id,
            },
        });
        if (!deleteMember) {
            res.status(400).json({
                msg: "Delete member gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Delete member berhasil dilakukan.",
            });
        }
    }
};

controllers.getInfoEditMember = async (req, res) => {
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
        var list = {};
        var i = 0;
        check = await Member.findOne({
            where: { id: body.id },
        }).then(async (e) => {
            list = {
                id: e.id,
                nama: e.nama,
                nip: e.nip,
                username: e.username,
                jabatan: e.jabatan,
                status: e.status,
                jenis_kelamin: e.jenis_kelamin,
            };
            i++;
        });
        res.status(200).json({
            msg: "Berhasil.",
            value: list,
        });
    }
};

module.exports = controllers;
