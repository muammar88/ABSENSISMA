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
                values: ['kepsek','guru','tata_usaha','operator_sekolah','pustakawan','satpam','penjaga_sekolah','cleaning_service','pengawas_pembina','pengelola_umum_operasional'],
            },
            status: {
                type: Sequelize.ENUM,
                values: ['pns','pppk','bakti','kontrak','honorer'],
            },
            status_active: {
                type: Sequelize.ENUM,
                values: ["active", "nonactive"],
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
