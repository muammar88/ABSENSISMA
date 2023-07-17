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
    daftarIzin,
    addizin,
    deleteIzin,
    getInfoEditIzin,
    updateIzin,
} = require("../../controllers/admin/izin");

// HELPER
const {
    checkGuruTendikID,
    checkIDIzin,
} = require("../../helpers/callback/helper_absensi");

// ROUTER
const router = express.Router();

router.post(
    "/admin/:kode/daftar_izin",
    [verifyAdminSession, verifyAdminToken],
    body("search").trim(),
    daftarIzin
);

router.post(
    "/admin/:kode/add_izin",
    [verifyAdminSession, verifyAdminToken],
    body("guru_tendik")
        .notEmpty()
        .withMessage("ID Guru & Tendik Tidak Boleh Kosong")
        .custom(checkGuruTendikID),
    body("tanggal_mulai")
        .notEmpty()
        .withMessage("Tanggal Mulai Tidak Boleh Kosong"),
    body("tanggal_akhir")
        .notEmpty()
        .withMessage("Tanggal Akhir Tidak Boleh Kosong"),
    body("status")
        .notEmpty()
        .withMessage("Status Tidak Boleh Kosong")
        .isIn(["dinasluar", "izin", "cutihamil", "sakit"]),
    addizin
);

router.post(
    "/admin/:kode/delete_izin",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Izin Tidak Boleh Kosong")
        .custom(checkIDIzin),
    deleteIzin
);

router.post(
    "/admin/:kode/info_edit_izin",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Izin Tidak Boleh Kosong")
        .custom(checkIDIzin),
    getInfoEditIzin
);

router.post(
    "/admin/:kode/update_izin",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Izin Tidak Boleh Kosong")
        .custom(checkIDIzin),
    body("guru_tendik")
        .notEmpty()
        .withMessage("ID Guru & Tendik Tidak Boleh Kosong")
        .custom(checkGuruTendikID),
    body("tanggal_mulai")
        .notEmpty()
        .withMessage("Tanggal Mulai Tidak Boleh Kosong"),
    body("tanggal_akhir")
        .notEmpty()
        .withMessage("Tanggal Akhir Tidak Boleh Kosong"),
    body("status")
        .notEmpty()
        .withMessage("Status Tidak Boleh Kosong")
        .isIn(["dinasluar", "izin", "cutihamil", "sakit"]),
    updateIzin
);

module.exports = router;
