"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Absensi extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Absensi.belongsTo(models.Member, {
                foreignKey: "memberId",
                // targetKey: "nip",
            });
            // DinasLuar.belongsTo(models.Member, {
            //     foreignKey: "nip",
            //     targetKey: "nip",
            // });
        }
    }
    Absensi.init(
        {
            memberId: DataTypes.INTEGER,
            masuk: DataTypes.TIME,
            latitude_masuk: DataTypes.STRING,
            longitude_masuk: DataTypes.STRING,
            keluar: DataTypes.TIME,
            latitude_keluar: DataTypes.STRING,
            longitude_keluar: DataTypes.STRING,
            tanggal: DataTypes.DATEONLY,
            ip: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Absensi",
        }
    );
    return Absensi;
};
