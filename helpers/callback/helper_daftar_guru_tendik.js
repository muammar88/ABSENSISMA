const bcrypt = require("bcrypt");

const { Op, Member } = require("../../db/models");

const helper = {};

helper.checkNIPMember = async (value, { req }) => {
    var body = req.body;
    if (body.id != undefined) {
        check = await Member.findOne({
            where: { nip: value, id: { $not: body.id } },
        });
    } else {
        check = await Member.findOne({
            where: { nip: value },
        });
    }
    if (check) {
        throw new Error("NIP Guru Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkUsernameMember = async (value, { req }) => {
    var body = req.body;
    if (body.id != undefined) {
        check = await Member.findOne({
            where: { username: value, id: { $not: body.id } },
        });
    } else {
        check = await Member.findOne({
            where: { username: value },
        });
    }
    if (check) {
        throw new Error("Username Sudah Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkIDMember = async (value) => {
    check = await Member.findOne({
        where: { id: value },
    });
    if (!check) {
        throw new Error("ID Guru Tidka Terdaftar Dipangkalan Data.");
    }
    return true;
};

module.exports = helper;
