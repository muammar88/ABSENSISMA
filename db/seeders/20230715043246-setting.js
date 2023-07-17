"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("Settings", [
            {
                setting_name: "nama_aplikasi",
                setting_value: "Absensi Guru & Tendik",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "nama_sekolah",
                setting_value: "SMA 9 Abdya",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "nama_kepala_sekolah",
                setting_value: "Abdullah Spd",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "nip_kepala_sekolah",
                setting_value: "123456789",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "mulai_absensi_masuk",
                setting_value: "07:30",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "akhir_absensi_masuk",
                setting_value: "09:00",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "mulai_absensi_keluar",
                setting_value: "16:00",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "akhir_absensi_keluar",
                setting_value: "16:30",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "hari_libur_mingguan",
                setting_value:
                    '{"jumat":"jumat","sabtu":"sabtu","minggu":"minggu"}',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "letitude",
                setting_value: "4.4577459",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "longitude",
                setting_value: "97.9689048",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                setting_name: "jarak",
                setting_value: "100",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
    },
};
