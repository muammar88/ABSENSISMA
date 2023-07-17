const jwt = require("jsonwebtoken");

module.exports = {
    varifyTokenMobile: function (req, res, next) {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token == null) return res.sendStatus(401);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(401);
            // req.no_hp = decoded.no_hp;
            next();
        });
    },
};
