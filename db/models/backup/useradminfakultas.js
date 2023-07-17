"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class UserAdminFakultas extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            UserAdminFakultas.belongsTo(models.User, {
                foreignKey: "user_id",
            });
            // define association here
            UserAdminFakultas.belongsTo(models.Fakultas, {
                foreignKey: "fakultas_id",
            });
        }
    }
    UserAdminFakultas.init(
        {
            user_id: DataTypes.INTEGER,
            fakultas_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "UserAdminFakultas",
        }
    );
    return UserAdminFakultas;
};
