const bcrypt = require("bcryptjs");

const { Op, Member, Absensi, Izin } = require("../../db/models");

const helper = {};

helper.checkGuruTendikID = async (value) => {
    check = await Member.findOne({
        where: { id: value },
    });
    if (!check) {
        throw new Error("ID Guru Tendik Terdaftar Dipangkalan Data.");
    }
    return true;
};

helper.checkIDAbsensi = async (value) => {
    check = await Absensi.findOne({
        where: { id: value },
    });
    if (!check) {
        throw new Error(
            "ID Absensi Guru Tendik Tidak Terdaftar Dipangkalan Data."
        );
    }
    return true;
};

helper.checkIDIzin = async (value) => {
    check = await Izin.findOne({
        where: { id: value },
    });
    if (!check) {
        throw new Error("ID Izin Tidak --- Terdaftar Dipangkalan Data.");
    }
    return true;
};

module.exports = helper;
