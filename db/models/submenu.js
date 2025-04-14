'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Submenu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Submenu.belongsTo(models.Menu, {
            foreignKey: "menuId",
        });
      // define association here
    }
  }
  Submenu.init({
    name: DataTypes.STRING,
    path: DataTypes.STRING,
    menuId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Submenu',
  });
  return Submenu;
};