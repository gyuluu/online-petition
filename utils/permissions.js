module.exports.isLogged = function isLogged(req, res, next) {
    if (!req.session.loggedIn) {
        res.redirect("/register");
    } else {
        next();
    }
};

module.exports.hasSigned = function hasSigned(req, res, next) {
    if (!req.session.signatureID) {
        res.redirect("/petition");
    } else {
        next();
    }
};
