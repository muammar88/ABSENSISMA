'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Waktu_kerja extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Waktu_kerja.init({
    hari: DataTypes.STRING,
    mulai_absensi_masuk: DataTypes.STRING,
    akhir_absensi_masuk: DataTypes.STRING,
    mulai_absensi_keluar: DataTypes.STRING,
    akhir_absensi_keluar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Waktu_kerja',
  });
  return Waktu_kerja;
};