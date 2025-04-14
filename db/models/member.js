"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Member extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Member.hasMany(models.Absensi, {
                foreignKey: "memberId",
            });
            Member.hasMany(models.Izin, {
                foreignKey: "memberId",
            });
        }
    }
    Member.init(
        {
            kode: DataTypes.STRING,
            nama: DataTypes.STRING,
            nip: DataTypes.STRING,
            username: DataTypes.STRING,
            password: DataTypes.STRING,
            jabatan: DataTypes.ENUM(["kepsek", "guru", "tendik"]),
            status: DataTypes.ENUM(["pns", "pppk", "bakti"]),
            status_active: DataTypes.ENUM(["active", "nonactive"]),
            jenis_kelamin: DataTypes.ENUM(["laki_laki", "perempuan"]),
        },
        {
            sequelize,
            modelName: "Member",
        }
    );
    return Member;
};
