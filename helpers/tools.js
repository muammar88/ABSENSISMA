const { sequelize, Op, Tag, Post } = require("../db/models");
var moment = require("moment");
// import { promises as fs } from "fs";
const { promises } = require("fs");

const helper = {};

helper.generateSlug = async (value) => {
    var splitText = value.split(" ");
    var newText = "";
    for (x = 0; x <= splitText.length; x++) {
        if (splitText[x] != undefined) {
            newText = newText + "-" + splitText[x];
        }
    }

    let condition = true;
    let i = 0;
    var returnText = "";
    while (condition) {
        if (i != 0) {
            returnText = newText;
        } else {
            returnText = newText + "-" + i;
        }
        check = await Post.findOne({ where: { slug: returnText } });
        if (!check) {
            condition = false;
        }
        i++;
    }

    return returnText;
};

helper.capitalize = async (text) => {
    return text.replace(/\b\w/g, function (m) {
        return m.toUpperCase();
    });
};

helper.checkTagId = async (value) => {
    check = await Tag.findOne({ where: { id: value } });
    if (!check) {
        return false;
    }
    return true;
};

helper.objectLength = async (object) => {
    return Object.keys(object).length;
};

helper.fileExists = async (path) =>
    !!(await promises.stat(path).catch((e) => false));

helper.text_limit = async (element, lenght) => {
    var new_text = "";
    var textElement = element.split(" ");

    if (lenght == undefined) lenght = 10;

    for (let index = 0; index < lenght; index++) {
        new_text = new_text + " " + textElement[index];
    }

    return new_text.trim() + "...";
};

module.exports = helper;
