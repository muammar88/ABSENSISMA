// MAIN PACKAGE
const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
// MIDDLEWARE
const { verifySession, verifyToken } = require("../middleware/VerifyDosen");
// const { varifyToken } = require("../middleware/VerifyToken");
// FILTE
var multer = require("multer");
const {
    dashboard,
    absensi,
    riwayatAbsensi,
    dataRiwayatAbsensi,
    daftarDinasLuar,
    dataDaftarDinasLuar,
    addDinasLuar,
    saveAddDinasLuar,
    logout,
    public,
    auth,
    dataDashboard,
    checkSess,
    tes,
} = require("../controllers/public/guru_tendik");

// HELPER
const { ckPasswordLama } = require("../helpers/callback");

// ROUTER
const router = express.Router();

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./photo/sk");
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: diskStorage }).single("sk");

router.get("/", public);

router.get("/guru_tendik/checkSession", checkSess);

router.post(
    "/guru_tendik/auth",
    body("username")
        .notEmpty()
        .withMessage("Username Tidak Boleh Kosong")
        .trim(),
    body("password").notEmpty().withMessage("Password Tidak Boleh Kosong"),
    auth
);
router.get("/guru_tendik/:kode", [verifySession], dashboard);

router.get(
    "/guru_tendik/:kode/dataDashboard",
    [verifySession, verifyToken],
    dataDashboard
);

// url: 'guru_tendik/' + kode + '/absensi',

router.post(
    "/guru_tendik/:kode/absensi",
    [verifySession, verifyToken],
    body("latitude")
        .notEmpty()
        .withMessage("Latitute Tidak Boleh Kosong")
        .isFloat()
        .withMessage("Format Latitute Tidak Sesuai Format"),
    body("longitude")
        .notEmpty()
        .withMessage("Longitute Tidak Boleh Kosong")
        .isFloat()
        .withMessage("Format Longitute Tidak Sesuai Format"),
    absensi
);

router.get("/guru_tendik/:kode/logout", [verifySession, verifyToken], logout);

router.get(
    "/guru_tendik/:kode/riwayatAbsensi",
    [verifySession],
    riwayatAbsensi
);

router.get(
    "/guru_tendik/:kode/dataRiwayatAbsensi/:perpage/:pageNumber",
    [verifySession, verifyToken],
    dataRiwayatAbsensi
);

// router.get("/dosen/:nip/daftarDinasLuar", [verifySession], daftarDinasLuar);

// router.get(
//     "/dosen/:nip/daftarDinasLuar/:perpage/:pageNumber",
//     [verifySession, verifyToken],
//     dataDaftarDinasLuar
// );

// router.get("/dosen/:nip/addDinasLuar", [verifySession], addDinasLuar);

// router.post(
//     "/dosen/:nip/saveAddDinasLuar",
//     upload,
//     body("start_date")
//         .notEmpty()
//         .withMessage("Tanggal mulai dinas luar tidak boleh kosong"),
//     body("end_date")
//         .notEmpty()
//         .withMessage("Tanggal akhir dinas luar tidak boleh kosong"),
//     [verifySession, verifyToken],
//     saveAddDinasLuar
// );

module.exports = router;
