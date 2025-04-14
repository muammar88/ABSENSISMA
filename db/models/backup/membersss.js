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
                foreignKey: "nip",
                sourceKey: "nip",
            });
            Member.hasMany(models.DinasLuar, {
                foreignKey: "nip",
                sourceKey: "nip",
            });
            Member.belongsTo(models.Fakultas, {
                foreignKey: "fakultas_id",
            });
        }
    }
    Member.init(
        {
            username: DataTypes.STRING,
            fullname: DataTypes.STRING,
            fakultas_id: DataTypes.INTEGER,
            refreshToken: DataTypes.TEXT,
            nip: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Member",
        }
    );
    return Member;
};
