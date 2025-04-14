const { User, Member } = require("../db/models");

const helper = {};

helper.randomString = async (length, chars) => {
    var result = "";
    for (var i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

helper.newMemberCode = async () => {
    var rand = 0;
    let condition = true;

    while (condition) {
        rand = await helper.randomString(
            6,
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        );
        check = await Member.findOne({ where: { kode: rand } });
        if (!check) condition = false;
    }
    return rand;
};

helper.newUserCode = async () => {
    var rand = 0;
    let condition = true;

    while (condition) {
        rand = await helper.randomString(
            6,
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
        );
        check = await User.findOne({ where: { kode: rand } });
        if (!check) condition = false;
    }
    return rand;
};
module.exports = helper;
