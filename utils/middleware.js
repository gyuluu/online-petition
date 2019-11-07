exports.requireNoSignature = function(req, res, next) {
    if (req.session.signatureId) {
        return res.redirect("/thanks");
    }
    next();
};

// this happens in index.js:
// const { requireNoSignature } = require("./middleware");
// app.get("/petition", requireNoSignature, (req, res) => {
//     res.render("petition");
// });

exports.requireSignature = function(req, res, next) {
    if (!req.session.signatureId) {
        return res.redirect("/petition");
    }
    next();
};

// the above function will run on signed, signers and and signersByCity
