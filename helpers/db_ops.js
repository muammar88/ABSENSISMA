const { sequelize, Op, Tag, Post } = require("../db/models");
var moment = require("moment");
const { promises } = require("fs");

const helper = {};

helper.db_list_server = async (value) => {
    var sqlTotal = {};
    if (value.hasOwnProperty("include")) {
        sqlTotal["include"] = value["include"];
    }
    if (value.hasOwnProperty("where")) {
        sqlTotal["where"] = value["where"];
    }
    return { total: sqlTotal, sql: value };
};

module.exports = helper;
