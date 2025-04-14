// // MAIN PACKAGE
// const express = require("express");
// const { verify } = require("jsonwebtoken");
// const path = require("path");
// const { body, validationResult } = require("express-validator");
// // MIDDLEWARE

// const {
//     verifyAdminSession,
//     verifyAdminToken,
//     verifyLevel,
// } = require("../../middleware/VerifyAdmin");

// // // FILTE
// // var multer = require("multer");
// // // menentukan lokasi pengunggahan
// // const diskStorage = multer.diskStorage({
// //     destination: function (req, file, callback) {
// //         callback(null, "./photo/sk");
// //     },
// //     filename: function (req, file, callback) {
// //         callback(null, Date.now() + path.extname(file.originalname));
// //     },
// // });

// // var upload = multer({ storage: diskStorage }).single("sk");

// // CONTROLLERS
// const {
//     riwayatAbsensi,
//     getInfoAddAbsensi,
//     addAbsensiGuruTendik,
//     deleteAbsensi,
//     getInfoEditAbsensi,
//     updateAbsensi,
// } = require("../../controllers/admin/absensi");
// // const { get_token, LogOut } = require("../controllers/auth");

// // HELPER
// const {
//     checkIDAbsensi,
//     checkGuruTendikID,
// } = require("../../helpers/callback/helper_absensi");

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

// FILTE
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
    // index,
    // areaAdmin,
    // auth,
    // dashboard_superadmin,
    // riwayatAbsensiHariIni,
    // getInfoProfil,
    // updateProfil,
    // daftarDinasLuar,
    // addDinasLuar,
    // deleteDinasLuar,
    // getInfoEditDinasLuar,
    // updateDinasLuar,
    // sinkronisasiDataDosen,
    daftarHariLibur,
    addHoliday,
    deleteHoliday,
    getInfoEditHoliday,
    updateHoliday,
    // daftarPengguna,
    // getKodePengguna,
    // addPengguna,
    // getListFakultas,
    // hapusPengguna,
    // getInfoEditPengguna,
    // updatePengguna,
    // addNewGuruTendik,
} = require("../../controllers/admin/hari_libur");
const { get_token, LogOut } = require("../../controllers/auth");

// HELPER
const {
    // checkIDDosen,
    // checkIDDinasLuar,
    checkBerulang,
    checkHolidayID,
    // checkKodePengguna,
    // checkUsernameExist,
    // checkLevelPengguna,
    // checkFakultasPengguna,
    // checkKonfirmasiPassword,
    // checkIDPengguna,
} = require("../../helpers/callback");

// ROUTER
const router = express.Router();

router.post(
    "/admin/:kode/daftar_hari_libur",
    [verifyAdminSession, verifyAdminToken],
    daftarHariLibur
);

router.post(
    "/admin/:kode/add_holiday",
    [verifyAdminSession, verifyAdminToken],
    body("keterangan").notEmpty().withMessage("Keterangan Tidak Boleh Kosong"),
    body("tanggal").notEmpty().withMessage("Tanggal Tidak Boleh Kosong"),
    body("repeat")
        .notEmpty()
        .withMessage("Kolom Berulang Tidak Boleh Kosong")
        .custom(checkBerulang),
    addHoliday
);

router.post(
    "/admin/:kode/deleteHoliday",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID holiday Tidak Boleh Kosong")
        .custom(checkHolidayID),
    deleteHoliday
);

router.post(
    "/admin/:kode/get_info_edit_holiday",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID holiday Tidak Boleh Kosong")
        .custom(checkHolidayID),
    getInfoEditHoliday
);

router.post(
    "/admin/:kode/update_holiday",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID holiday Tidak Boleh Kosong")
        .custom(checkHolidayID),
    body("keterangan").notEmpty().withMessage("Keterangan Tidak Boleh Kosong"),
    body("tanggal").notEmpty().withMessage("Tanggal Tidak Boleh Kosong"),
    body("repeat")
        .notEmpty()
        .withMessage("Kolom Berulang Tidak Boleh Kosong")
        .custom(checkBerulang),
    updateHoliday
);

module.exports = router;
