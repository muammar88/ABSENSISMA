"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert("Users", [
            {
                id: "1",
                kode: "AA21BB",
                name: "admin",
                level: "superadmin",
                password:
                    "$2a$12$1ptCqPRrda7u3Y4r/YPL4etMsyrUxFMJEiPWbHltpbCtmbFwP6I7G",
                refreshToken: "",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {},
};
