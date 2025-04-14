module.exports = {
    varifySessionMobile: function (req, res, next) {
        if (!req.session.member_id) {
            return res
                .status(401)
                .json({ error: "Anda Belum Melakukan Login" });
        }
        next();
    },
};
