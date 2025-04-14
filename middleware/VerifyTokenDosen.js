const jwt = require("jsonwebtoken");

module.exports = {
    // verifyTokenParamDosen: function (req, res, next) {
    //     const param = req.params;
    //     var nip = param.nip;
    //     if (req.session.loginList.includes(nip)) {
    //         const authHeader = req.headers["authorization"];
    //         const token = authHeader && authHeader.split(" ")[1];
    //         if (token == null) return res.sendStatus(401);
    //         jwt.verify(
    //             token,
    //             process.env.ACCESS_TOKEN_SECRET,
    //             (err, decoded) => {
    //                 if (err) {
    //                     return res.sendStatus(401);
    //                 } else {
    //                     nip_token = decoded.nip;
    //                     if (nip_token != nip) {
    //                         const index = req.session.loginList.indexOf(nip);
    //                         if (index > -1) {
    //                             req.session.loginList.splice(index, 1);
    //                         }
    //                         return res.sendStatus(401);
    //                     }
    //                 }
    //                 next();
    //             }
    //         );
    //     } else {
    //         return res.redirect("/");
    //     }
    // },
};
