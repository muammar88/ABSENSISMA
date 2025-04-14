"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Izins", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            memberId: {
                type: Sequelize.INTEGER,
                references: {
                    model: "Members",
                    key: "id",
                },
            },
            start_date: {
                type: Sequelize.DATEONLY,
            },
            end_date: {
                type: Sequelize.DATEONLY,
            },
            status: {
                type: Sequelize.ENUM,
                values: ["dinasluar", "izin", "cutihamil", "sakit"],
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
        await queryInterface.dropTable("Izins");
    },
};
