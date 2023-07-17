const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
//import moment from "moment";
const moment = require("moment");
const { Op, sequelize, Holiday } = require("../../db/models");

const { text_limit } = require("../../helpers/tools");

const { newUserCode } = require("../../helpers/random");

const { db_list_server } = require("../../helpers/db_ops");

const { NowOnly } = require("../../helpers/date_ops");

const { validationResult } = require("express-validator");

const controllers = {};

controllers.daftarHariLibur = async (req, res) => {
    const body = req.body;
    var search = "";
    var limit = body.perpage;
    var page = 1;
    if (body.pageNumber != undefined) page = body.pageNumber;
    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = ["id", "dateHoliday", "ket", "repeat"];
    if (body.search != undefined && body.search != "") {
        search = body.search;
        sql["where"] = {
            dateHoliday: "%" + search + "%",
        };
    }
    const query = await db_list_server(sql);
    const q_total = await Holiday.findAndCountAll(query.total);
    const total = await q_total.count;
    var list = {};
    if (total > 0) {
        var list = {};
        await Holiday.findAll(query.sql).then(async (value) => {
            var i = 0;
            await Promise.all(
                value.map(async (e) => {
                    list[i] = {
                        id: e.id,
                        dateHoliday: e.dateHoliday,
                        ket: e.ket,
                        repeat: e.repeat,
                        tanggal_pembaharuan: e.updatedAt,
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

controllers.addHoliday = async (req, res) => {
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
        var data = {};
        data["dateHoliday"] = body.tanggal;
        data["ket"] = body.keterangan;
        data["repeat"] = body.repeat;
        data["createdAt"] = myDate;
        data["updatedAt"] = myDate;
        const insert = await Holiday.create(data);
        if (!insert) {
            res.status(400).json({
                msg: "Proses penambahan hari libur gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Proses penambahan hari libur berhasil dilakukan.",
            });
        }
    }
};

controllers.deleteHoliday = async (req, res) => {
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
        const deleteHoliday = await Holiday.destroy({
            where: {
                id: body.id,
            },
        });
        if (!deleteHoliday) {
            res.status(400).json({
                msg: "Delete hari libur gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Delete hari libur berhasil dilakukan.",
            });
        }
    }
};

controllers.getInfoEditHoliday = async (req, res) => {
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
        await Holiday.findOne({
            attributes: ["id", "dateHoliday", "ket", "repeat"],
            where: {
                id: body.id,
            },
        }).then((e) => {
            if (e) {
                var data = {};
                data["id"] = e.id;
                data["dateHoliday"] = e.dateHoliday;
                data["ket"] = e.ket;
                data["repeat"] = e.repeat;

                res.status(200).json({
                    data: data,
                });
            } else {
                res.status(400).json({
                    msg: "ID Holiday tidak ditemukan",
                });
            }
        });
    }
};

controllers.updateHoliday = async (req, res) => {
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
        var data = {};
        data["dateHoliday"] = body.tanggal;
        data["ket"] = body.keterangan;
        data["repeat"] = body.repeat;
        data["updatedAt"] = myDate;
        var update = await Holiday.update(data, {
            where: { id: body.id },
        });
        if (!update) {
            res.status(400).json({
                msg: "Proses update holiday gagal dilakukan.",
            });
        } else {
            res.status(200).json({
                msg: "Proses update holiday berhasil dilakukan.",
            });
        }
    }
};
module.exports = controllers;
