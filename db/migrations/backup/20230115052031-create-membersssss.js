"use strict";
/** @type {import('sequelize-cli').Migration} */

// username: DataTypes.STRING,
// fullname: DataTypes.STRING,
// refreshToken: DataTypes.TEXT,
// nip: DataTypes.STRING,

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Members", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            username: {
                type: Sequelize.STRING,
            },
            fullname: {
                type: Sequelize.STRING,
            },
            refreshToken: {
                type: Sequelize.TEXT,
            },
            nip: {
                type: Sequelize.STRING,
            },
            fakultas_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "Fakultas",
                    key: "id",
                },
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
