// MAIN PACKAGE
const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
// MIDDLEWARE

const {
    verifyAdminSession,
    verifyAdminToken,
} = require("../../middleware/VerifyAdmin");

// CONTROLLERS
const {
    daftarGuruTendik,
    addNewGuruTendik,
    updateGuruTendik,
    deleteGuruTendik,
    getInfoEditMember,
} = require("../../controllers/admin/guru_tendik");

// HELPER
const {
    checkNIPMember,
    checkUsernameMember,
    checkIDMember,
} = require("../../helpers/callback/helper_daftar_guru_tendik");

// ROUTER
const router = express.Router();

router.post(
    "/admin/:kode/daftar_guru_tendik",
    [verifyAdminSession, verifyAdminToken],
    body("search").trim(),
    daftarGuruTendik
);

router.post(
    "/admin/:kode/add_new_guru_tendik",
    [verifyAdminSession, verifyAdminToken],
    body("nama").notEmpty().withMessage("Nama Guru Tidak Boleh Kosong"),
    body("nip")
        .notEmpty()
        .withMessage("NIP Guru Tidak Boleh Kosong")
        .trim()
        .custom(checkNIPMember),
    body("jenis_kelamin")
        .notEmpty()
        .withMessage("Jenis Kelamin Tidak Boleh Kosong")
        .isIn(["laki_laki", "perempuan"])
        .withMessage("Jenis kelamin tidak valid")
        .trim(),
    body("jabatan")
        .notEmpty()
        .withMessage("Jabatan Tidak Boleh Kosong")
        .isIn(["kepsek", "guru", "tendik"])
        .withMessage("Jabatan tidak valid")
        .trim(),
    body("status")
        .notEmpty()
        .withMessage("Status Tidak Boleh Kosong")
        .isIn(["pns", "pppk", "bakti"])
        .withMessage("Status pegawai tidak valid")
        .trim(),
    body("username")
        .notEmpty()
        .withMessage("Username Tidak Boleh Kosong")
        .custom(checkUsernameMember)
        .trim(),
    body("password")
        .notEmpty()
        .withMessage("Password Tidak Boleh Kosong")
        .trim(),
    addNewGuruTendik
);

router.post(
    "/admin/:kode/update_guru_tendik",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Guru Tidak Boleh Kosong")
        .isNumeric()
        .withMessage("ID Guru Dalam Angka")
        .trim()
        .custom(checkIDMember),
    body("nama").notEmpty().withMessage("Keterangan Tidak Boleh Kosong"),
    body("nip")
        .notEmpty()
        .withMessage("NIP Tidak Boleh Kosong")
        .trim()
        .custom(checkNIPMember),
    body("jenis_kelamin")
        .notEmpty()
        .withMessage("Jenis Kelamin Tidak Boleh Kosong")
        .isIn(["laki_laki", "perempuan"])
        .withMessage("Jenis kelamin tidak valid")
        .trim(),
    body("jabatan")
        .notEmpty()
        .withMessage("Jabatan Tidak Boleh Kosong")
        .isIn(["kepsek", "guru", "tendik"])
        .withMessage("Jabatan tidak valid")
        .trim(),
    body("status")
        .notEmpty()
        .withMessage("Status Tidak Boleh Kosong")
        .isIn(["pns", "pppk", "bakti"])
        .withMessage("Status pegawai tidak valid")
        .trim(),
    body("username")
        .notEmpty()
        .withMessage("Username Tidak Boleh Kosong")
        .custom(checkUsernameMember)
        .trim(),
    body("password")
        // .notEmpty()
        // .withMessage("Password Tidak Boleh Kosong")
        .trim(),
    updateGuruTendik
);

router.post(
    "/admin/:kode/getInfoEditMember",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Guru Tidak Boleh Kosong")
        .isNumeric()
        .withMessage("ID Guru Dalam Angka")
        .trim()
        .custom(checkIDMember),
    getInfoEditMember
);

router.post(
    "/admin/:kode/deleteGuruTendik",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Guru Tidak Boleh Kosong")
        .isNumeric()
        .withMessage("ID Guru Dalam Angka")
        .trim()
        .custom(checkIDMember),
    deleteGuruTendik
);

module.exports = router;
