"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Izin extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Izin.belongsTo(models.Member, {
                foreignKey: "memberId",
            });
        }
    }
    Izin.init(
        {
            memberId: DataTypes.INTEGER,
            start_date: DataTypes.DATEONLY,
            end_date: DataTypes.DATEONLY,
            status: DataTypes.ENUM(["dinasluar", "izin", "cutihamil", "sakit"]),
        },
        {
            sequelize,
            modelName: "Izin",
        }
    );
    return Izin;
};
