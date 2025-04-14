const jwt = require("jsonwebtoken");
const { dirname } = require("path");
const { Sequelize, Op, User } = require("../db/models");

const controllers = {};

controllers.get_token = async function (req, res) {
    // check session type is exist
    if (req.session.admin_id) {
        // get data dosen from database
        const user = await User.findOne({
            where: { name: req.session.name },
        });
        // filter
        if (user) {
            const name = user.name;
            const admin_id = user.id;
            const accessToken = jwt.sign(
                { name, admin_id },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: "2000s" }
            );

            const refreshToken = jwt.sign(
                { name, admin_id },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: "1d" }
            );

            await User.update(
                { refreshToken: refreshToken },
                { where: { name: req.session.name } }
            );

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 10000,
            });

            req.session.name = name;
            req.session.admin_id = admin_id;
            res.json({ accessToken });
        } else {
            res.status(401).json({ error: "User tidak ditemukan" });
        }
    } else {
        res.status(401).json({ error: "Token tidak dapat digenerate" });
    }
};

controllers.LogOut = async function (req, res) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                res.status(400).json({
                    error: true,
                    error_msg: "Logout Gagal",
                });
            } else {
                res.status(200).json({
                    error: false,
                    error_msg: "Logout Berhasil",
                });
            }
        });
    } else {
        res.status(400).json({
            error: true,
            error_msg: "Logout Gagal",
        });
    }
};

module.exports = controllers;
