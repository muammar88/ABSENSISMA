"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("Menus", [
            {
                name: "Beranda",
                path: "beranda",
                icon: "fas fa-home",
                submenu: "not_exis",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Absensi",
                path: "absensi",
                icon: "fas fa-check-double",
                submenu: "exis",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: "Guru & Tendik",
                path: "guru_tendik",
                icon: "fas fa-chalkboard-teacher",
                submenu: "exis",
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
