"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class DinasLuar extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            DinasLuar.belongsTo(models.Member, {
                foreignKey: "nip",
                targetKey: "nip",
            });
        }
    }
    DinasLuar.init(
        {
            nip: DataTypes.STRING,
            start_date: DataTypes.DATE,
            end_date: DataTypes.DATE,
            status: DataTypes.ENUM(["approve", "reject"]),
            sk: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "DinasLuar",
        }
    );
    return DinasLuar;
};
