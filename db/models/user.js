"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // User.belongsTo(models.Group, {
            //     foreignKey: "groupId",
            // });
            // User.belongsTo(models.Fakultas, {
            //     foreignKey: "fakultas_id",
            // });
            // User.hasMany(models.UserAdminFakultas, {
            //     foreignKey: "user_id",
            // });
        }
    }
    User.init(
        {
            name: DataTypes.STRING,
            kode: DataTypes.STRING,
            level: DataTypes.ENUM([
                "superadmin",
                "adminitrator_biro",
                "adminitrator_fakultas",
            ]),
            refreshToken: DataTypes.TEXT,
            password: DataTypes.STRING,
            // groupId: DataTypes.INTEGER,
            // fakultas_id: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
