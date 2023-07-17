const jwt = require("jsonwebtoken");

module.exports = {
    verifySession: function (req, res, next) {
        console.log("req.session.loginList");
        console.log(req.session.loginList);
        console.log("req.session.loginList");

        if (!req.session.loginList) {
            console.log("++++++++1");
            return res.redirect("/");
        } else {
            const param = req.params;
            var kode = param.kode;
            console.log("-------------kode");
            console.log(kode);
            console.log(req.session.loginList);
            console.log("-------------kode");
            if (!req.session.loginList.includes(kode)) {
                console.log("++++++++2");
                return res.redirect("/");
            }
        }
        next();
    },
    verifyToken: function (req, res, next) {
        const param = req.params;
        var kode = param.kode;
        if (req.session.loginList.includes(kode)) {
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
                            console.log("=============token Hapus");
                            const index = req.session.loginList.indexOf(kode);
                            if (index > -1) {
                                req.session.loginList.splice(index, 1);
                            }
                            return res.sendStatus(401);
                        }
                        console.log("=============token5");
                    }
                    next();
                }
            );
        } else {
            return res.sendStatus(401);
        }
    },
};
