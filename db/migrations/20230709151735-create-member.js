"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Members", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            kode: {
                type: Sequelize.STRING,
            },
            nama: {
                type: Sequelize.STRING,
            },
            nip: {
                type: Sequelize.STRING,
            },
            username: {
                type: Sequelize.STRING,
            },
            password: {
                type: Sequelize.STRING,
            },
            jabatan: {
                type: Sequelize.ENUM,
                values: ["kepsek", "guru", "tendik"],
            },
            status: {
                type: Sequelize.ENUM,
                values: ["pns", "pppk", "bakti"],
            },
            jenis_kelamin: {
                type: Sequelize.ENUM,
                values: ["laki_laki", "perempuan"],
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Members");
    },
};
