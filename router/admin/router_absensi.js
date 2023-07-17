// MAIN PACKAGE
const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
// MIDDLEWARE

const {
    verifyAdminSession,
    verifyAdminToken,
    verifyLevel,
} = require("../../middleware/VerifyAdmin");

// // FILTE
// var multer = require("multer");
// // menentukan lokasi pengunggahan
// const diskStorage = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, "./photo/sk");
//     },
//     filename: function (req, file, callback) {
//         callback(null, Date.now() + path.extname(file.originalname));
//     },
// });

// var upload = multer({ storage: diskStorage }).single("sk");

// CONTROLLERS
const {
    riwayatAbsensi,
    getInfoAddAbsensi,
    addAbsensiGuruTendik,
    deleteAbsensi,
    getInfoEditAbsensi,
    updateAbsensi,
} = require("../../controllers/admin/absensi");
// const { get_token, LogOut } = require("../controllers/auth");

// HELPER
const {
    checkIDAbsensi,
    checkGuruTendikID,
} = require("../../helpers/callback/helper_absensi");

// ROUTER
const router = express.Router();

router.post(
    "/admin/:kode/riwayat_absensi",
    [verifyAdminSession, verifyAdminToken],
    body("search").trim(),
    riwayatAbsensi
);

router.get(
    "/admin/:kode/info_list_absensi",
    [verifyAdminSession, verifyAdminToken],
    getInfoAddAbsensi
);

router.post(
    "/admin/:kode/add_absensi_guru_tendik",
    [verifyAdminSession, verifyAdminToken],
    body("guru_tendik")
        .notEmpty()
        .withMessage("ID Guru / Tendik Tidak Boleh Kosong")
        .custom(checkGuruTendikID),
    body("tanggal").notEmpty().withMessage("Tanggal Tidak Boleh Kosong"),
    body("waktu_masuk")
        .notEmpty()
        .withMessage("Waktu Masuk Tidak Boleh Kosong"),
    body("waktu_keluar")
        .notEmpty()
        .withMessage("Waktu Keluar Tidak Boleh Kosong"),
    addAbsensiGuruTendik
);

router.post(
    "/admin/:kode/delete_absensi",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Absensi Tidak Boleh Kosong")
        .custom(checkIDAbsensi),
    deleteAbsensi
);

router.post(
    "/admin/:kode/get_info_edit_absensi",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Absensi Tidak Boleh Kosong")
        .custom(checkIDAbsensi),
    getInfoEditAbsensi
);

router.post(
    "/admin/:kode/update_absensi",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Absensi Dosen Tidak Boleh Kosong")
        .custom(checkIDAbsensi),
    body("guru_tendik")
        .notEmpty()
        .withMessage("ID Guru / Tendik Tidak Boleh Kosong")
        .custom(checkGuruTendikID),
    body("tanggal").notEmpty().withMessage("Tanggal Tidak Boleh Kosong"),
    body("waktu_masuk")
        .notEmpty()
        .withMessage("Waktu Masuk Tidak Boleh Kosong"),
    body("waktu_keluar")
        .notEmpty()
        .withMessage("Waktu Keluar Tidak Boleh Kosong"),
    updateAbsensi
);

module.exports = router;
