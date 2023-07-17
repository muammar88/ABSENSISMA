const bcrypt = require("bcrypt");
// const session = require("express-session");
var moment = require("moment");
const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");
const { Op, Member, Absensi, DinasLuar, Holiday } = require("../db/models");

const { validationResult } = require("express-validator");

const controllers = {};

module.exports = controllers;
