// MAIN PACKAGE
const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const fs = require("fs");
// MIDDLEWARE

const {
    verifyAdminSession,
    verifyAdminToken,
    verifyLevel,
} = require("../middleware/VerifyAdmin");

// FILTE
var multer = require("multer");
// menentukan lokasi pengunggahan
const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./photo/sk");
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: diskStorage }).single("sk");

// CONTROLLERS
const {
    index,
    areaAdmin,
    auth,
    dashboard_superadmin,
    riwayatAbsensiHariIni,
    getInfoProfil,
    updateProfil,
    daftarDinasLuar,
    addDinasLuar,
    deleteDinasLuar,
    getInfoEditDinasLuar,
    updateDinasLuar,

    daftarHariLibur,
    addHoliday,
    deleteHoliday,
    getInfoEditHoliday,
    updateHoliday,
    daftarPengguna,
    getKodePengguna,
    addPengguna,
    getListFakultas,
    hapusPengguna,
    getInfoEditPengguna,
    updatePengguna,
    addNewGuruTendik,
    getInfoPengaturanUmum,
    simpanPerubahanPengaturan,
    cetakPdf,
} = require("../controllers/admin");
const { get_token, LogOut } = require("../controllers/auth");

// HELPER
const {
    checkIDDosen,
    checkIDDinasLuar,
    checkBerulang,
    checkHolidayID,
    checkKodePengguna,
    checkUsernameExist,
    checkLevelPengguna,
    checkFakultasPengguna,
    checkKonfirmasiPassword,
    checkIDPengguna,
} = require("../helpers/callback");

// ROUTER
const router = express.Router();

router.get("/admin/", index);

router.post(
    "/admin/auth",
    body("username").notEmpty().withMessage("Username Tidak Boleh Kosong"),
    body("password").notEmpty().withMessage("Password Tidak Boleh Kosong"),
    auth
);

router.get("/admin/:kode", [verifyAdminSession], areaAdmin);

router.get(
    "/admin/:kode/logout",
    [verifyAdminSession, verifyAdminToken],
    LogOut
);

router.post(
    "/admin/:kode/dashboard_superadmin",
    [verifyAdminSession, verifyAdminToken],
    dashboard_superadmin
);

router.post(
    "/admin/:kode/riwayat_absensi_hari_ini",
    [verifyAdminSession, verifyAdminToken],
    riwayatAbsensiHariIni
);

router.get(
    "/admin/:kode/get_info_profil",
    [verifyAdminSession, verifyAdminToken],
    getInfoProfil
);

router.post(
    "/admin/:kode/update_profil",
    body("username").notEmpty().withMessage("Username Tidak Boleh Kosong"),
    [verifyAdminSession, verifyAdminToken],
    updateProfil
);

router.get(
    "/admin/:kode/get_kode_pengguna",
    [verifyAdminSession, verifyAdminToken],
    getKodePengguna
);

router.get(
    "/admin/:kode/get_list_fakultas",
    [verifyAdminSession, verifyAdminToken],
    getListFakultas
);

router.post(
    "/admin/:kode/daftar_pengguna",
    [verifyAdminSession, verifyAdminToken],
    daftarPengguna
);

router.post(
    "/admin/:kode/add_pengguna",
    [verifyAdminSession, verifyAdminToken],
    body("kode")
        .notEmpty()
        .withMessage("Kode Pengguna Tidak Boleh Kosong")
        .custom(checkKodePengguna),
    body("username")
        .notEmpty()
        .withMessage("Username Pengguna Tidak Boleh Kosong")
        .custom(checkUsernameExist),
    body("level")
        .notEmpty()
        .withMessage("Level Pengguna Tidak Boleh Kosong")
        .custom(checkLevelPengguna),
    body("fakultas").custom(checkFakultasPengguna),
    body("password")
        .notEmpty()
        .withMessage("Password Pengguna Tidak Boleh Kosong"),
    body("konf_password")
        .notEmpty()
        .withMessage("Password Pengguna Tidak Boleh Kosong")
        .custom(checkKonfirmasiPassword),
    addPengguna
);

router.post(
    "/admin/:kode/hapus_pengguna",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Pengguna Tidak Boleh Kosong")
        .custom(checkIDPengguna),
    hapusPengguna
);

router.post(
    "/admin/:kode/get_info_pengaturan_umum",
    [verifyAdminSession, verifyAdminToken],
    getInfoPengaturanUmum
);

router.post(
    "/admin/:kode/get_info_edit_pengguna",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Pengguna Tidak Boleh Kosong")
        .custom(checkIDPengguna),
    getInfoEditPengguna
);

router.post(
    "/admin/:kode/edit_pengguna",
    [verifyAdminSession, verifyAdminToken],
    body("id")
        .notEmpty()
        .withMessage("ID Pengguna Tidak Boleh Kosong")
        .custom(checkIDPengguna),
    body("kode")
        .notEmpty()
        .withMessage("Kode Pengguna Tidak Boleh Kosong")
        .custom(checkKodePengguna),
    body("username")
        .notEmpty()
        .withMessage("Username Pengguna Tidak Boleh Kosong")
        .custom(checkUsernameExist),
    body("level")
        .notEmpty()
        .withMessage("Level Pengguna Tidak Boleh Kosong")
        .custom(checkLevelPengguna),
    body("fakultas").custom(checkFakultasPengguna),
    body("konf_password").custom(checkKonfirmasiPassword),
    updatePengguna
);

router.post("/admin/:kode/simpanPerubahanPengaturan", [
    verifyAdminSession,
    verifyAdminToken,
    body("nama_aplikasi")
        .notEmpty()
        .withMessage("Nama aplikasi tidak boleh kosong"),
    body("nama_sekolah")
        .notEmpty()
        .withMessage("Nama sekolah tidak boleh kosong"),
    body("nama_kepala_sekolah")
        .notEmpty()
        .withMessage("Nama kepala sekolah tidak boleh kosong"),
    body("nip_kepala_sekolah")
        .notEmpty()
        .withMessage("NIP kepala sekolah tidak boleh kosong"),
    body("mulai_absensi_masuk")
        .notEmpty()
        .withMessage("Mulai absensi masuk tidak boleh kosong"),
    body("akhir_absensi_masuk")
        .notEmpty()
        .withMessage("Akhir absensi masuk tidak boleh kosong"),
    body("mulai_absensi_keluar")
        .notEmpty()
        .withMessage("Mulai absensi keluar tidak boleh kosong"),
    body("akhir_absensi_keluar")
        .notEmpty()
        .withMessage("Akhir absensi keluar tidak boleh kosong"),
    body("letitude")
        .notEmpty()
        .withMessage("Letitude tidak boleh kosong")
        .isFloat()
        .withMessage("Format Letitude tidak sesuai"),
    body("longitude")
        .notEmpty()
        .withMessage("Longitude tidak boleh kosong")
        .isFloat()
        .withMessage("Format Longitude tidak sesuai"),
    body("jarak")
        .notEmpty()
        .withMessage("Jarak tidak boleh kosong")
        .isNumeric()
        .withMessage("Format Jarak tidak sesuai"),
    simpanPerubahanPengaturan,
]);

router.get("/cetak-pdf/:kode/:bulan/:tahun", cetakPdf);

module.exports = router;
