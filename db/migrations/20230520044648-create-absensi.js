"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Absensis", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            memberId: {
                type: Sequelize.STRING,
                references: {
                    model: "Members",
                    key: "id",
                },
            },
            masuk: {
                type: Sequelize.TIME,
            },
            latitude_masuk: {
                type: Sequelize.STRING,
            },
            longitude_masuk: {
                type: Sequelize.STRING,
            },
            keluar: {
                type: Sequelize.TIME,
            },
            latitude_keluar: {
                type: Sequelize.STRING,
            },
            longitude_keluar: {
                type: Sequelize.STRING,
            },
            tanggal: {
                type: Sequelize.DATEONLY,
            },
            ip: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable("Absensis");
    },
};
