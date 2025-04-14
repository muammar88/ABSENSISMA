const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
// MIDDLEWARE
const { varifyTokenMobile } = require("../middleware/VerifyTokenMobile");
const { varifySessionMobile } = require("../middleware/VerifySessionMobile");

const {
    checkToken,
    auth,
    dashboard,
    absen_dosen,
    riwayatAbsensi,
    riwayatDl,
    addDinasLuar,
    loginChecking,
} = require("../controllers/mobile");

// FILTE
var multer = require("multer");

// ROUTER
const router = express.Router();

// var storage_galeri = multer.diskStorage({
//     destination: function (req, file, callback) {
//         callback(null, "./photo/sk");
//     },
//     filename: function (req, file, callback) {
//         callback(null, Date.now() + path.extname(file.originalname));
//     },
// });
// var upload = multer({ storage: storage_galeri }).array("sk[]", 10);

// menentukan lokasi pengunggahan
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./photo/sk");
        // cb(null, path.join(__dirname, "public/uploads"));
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: diskStorage }).single("sk");

router.post(
    "/mobile_api/login",
    body("username").notEmpty().withMessage("Username Tidak Boleh Kosong"),
    body("password").notEmpty().withMessage("Password Tidak Boleh Kosong"),
    auth
);

router.post(
    "/mobile_api/login_checking",
    body("token").notEmpty().withMessage("Token Tidak Boleh Kosong"),
    body("username").notEmpty().withMessage("Username Tidak Boleh Kosong"),
    body("password").notEmpty().withMessage("Password Tidak Boleh Kosong"),
    loginChecking
);

router.get("/mobile_api/check_token/:token/nip/:nip", checkToken);

router.get("/mobile_api/dashboard", [varifyTokenMobile], dashboard);

router.get("/mobile_api/absen_dosen", [varifyTokenMobile], absen_dosen);

router.post("/mobile_api/riwayat_absensi", [varifyTokenMobile], riwayatAbsensi);

router.post("/mobile_api/riwayat_dinas_luar", [varifyTokenMobile], riwayatDl);

router.post(
    "/mobile_api/add_dinas_luar",
    [varifySessionMobile],
    upload,
    body("start_date")
        .notEmpty()
        .withMessage("Tanggal mulai dinas luar tidak boleh kosong"),
    body("end_date")
        .notEmpty()
        .withMessage("Tanggal akhir dinas luar tidak boleh kosong"),
    addDinasLuar
);

module.exports = router;
