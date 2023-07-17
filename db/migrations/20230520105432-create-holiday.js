"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Holidays", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            dateHoliday: {
                type: Sequelize.DATEONLY,
            },
            ket: {
                type: Sequelize.STRING,
            },
            repeat: {
                type: Sequelize.ENUM,
                values: ["annually", "onetime"],
                defaultValue: "onetime",
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
        await queryInterface.dropTable("Holidays");
    },
};
