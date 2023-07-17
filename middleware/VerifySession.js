module.exports = {
    varifySession: function (req, res, next) {
        if (!req.session.admin_id) {
            return res.redirect("/");
        }
        next();
    },
};
