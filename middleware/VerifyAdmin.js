const jwt = require("jsonwebtoken");

module.exports = {
    verifyAdminSession: function (req, res, next) {
        if (!req.session.loginAdminList) {
            return res.redirect("/admin");
        } else {
            const param = req.params;
            var kode = param.kode;
            if (!req.session.loginAdminList.includes(kode)) {
                return res.redirect("/admin");
            }
        }
        next();
    },
    verifyAdminToken: function (req, res, next) {
        const param = req.params;
        var kode = param.kode;
        if (req.session.loginAdminList.includes(kode)) {
            const authHeader = req.headers["authorization"];
            const token = authHeader && authHeader.split(" ")[1];
            if (token == null) return res.sendStatus(401);
            jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET,
                (err, decoded) => {
                    if (err) {
                        return res.sendStatus(401);
                    } else {
                        kode_token = decoded.kode;
                        if (kode_token != kode) {
                            const index =
                                req.session.loginAdminList.indexOf(kode);
                            if (index > -1) {
                                req.session.loginAdminList.splice(index, 1);
                            }
                            return res.sendStatus(401);
                        }
                    }
                    next();
                }
            );
        } else {
            return res.sendStatus(401);
        }
    },

    // verifyLevel: function (req, res, next) {
    //     const param = req.params;
    //     var kode = param.kode;

    // },
};
