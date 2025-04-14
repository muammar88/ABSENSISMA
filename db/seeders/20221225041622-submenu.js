"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("Submenus", [
            {
                name: "Riwayat Absensi",
                menuId: 2,
                path: "riwayat_absensi",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // {
            //     name: "Request Saldo Member",
            //     menuId: 2,
            //     path: "request_saldo_member",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            {
                name: "Daftar Guru & Tendik",
                menuId: 3,
                path: "daftar_guru_tendik",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // {
            //     name: "Daftar Server",
            //     menuId: 4,
            //     path: "daftar_server",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            // {
            //     name: "Daftar Operator",
            //     menuId: 4,
            //     path: "daftar_operator",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            // {
            //     name: "Produk",
            //     menuId: 4,
            //     path: "produk",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            // {
            //     name: "Produk Server",
            //     menuId: 4,
            //     path: "produk_server",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            // {
            //     name: "Pengaturan Umum",
            //     menuId: 5,
            //     path: "pengaturan_umum",
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
        ]);
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
         */
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
