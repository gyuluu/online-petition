const db = require("./utils/db");
const { hash, compare } = require("./utils/bc");
const capitalize = require("./utils/capitalize");
const express = require("express");
const app = (exports.app = express());
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(csurf());

app.use(function(req, res, next) {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.loggedIn) {
        if (["/", "/register", "/login"].includes(req.url)) {
            next();
        } else {
            res.redirect("/");
        }
    } else {
        if (["/", "/register", "/login"].includes(req.url)) {
            if (req.session.userId) {
                res.redirect("/petition/signed");
            } else {
                res.redirect("/petition");
            }
        } else {
            next();
        }
    }
});

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/home", (req, res) => {
    res.send("<h1>Welcome home</h1>");
});

app.get("/welcome", (req, res) => {
    if (req.session.fakeCookieForDemo) {
        res.send("<p>wow you have a cookie</p>");
    } else {
        res.redirect("/home");
    }
});

app.post("/welcome", (req, res) => {
    req.session.wentToWelcome = "hell yea";
    res.redirect("/home");
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.post("/register", (req, res) => {
    if (req.body.password == "") {
        res.render("register", {
            error: "error",
            layout: "main"
        });
    } else {
        hash(req.body.password)
            .then(hash => {
                db.addUser(req.body.first, req.body.last, req.body.email, hash)
                    .then(id => {
                        req.session.userId = id;
                        req.session.loggedIn = true;
                        req.session.canAddInfo = true;
                        res.redirect("/profile");
                    })
                    .catch(err => {
                        console.log("it didnt insert because:", err);
                        res.render("register", {
                            error: "error",
                            layout: "main"
                        });
                    });
            })
            .catch(e => console.log(e));
    }
});

app.get("/profile", (req, res) => {
    if (req.session.canAddInfo) {
        res.render("profile", {
            layout: "main"
        });
    } else {
        res.redirect("/petition");
    }
});

app.post("/profile", (req, res) => {
    let requrl;
    if (
        !req.body.url.startsWith("http://") ||
        !req.body.url.startsWith("https://")
    ) {
        requrl = "http://" + req.body.url;
    }
    if (requrl == "https://" || requrl == "http://") {
        requrl = null;
    }
    db.addBio(req.body.age, req.body.city, requrl, req.session.userId).then(
        () => {
            req.session.canAddInfo = null;
            res.redirect("/petition");
        }
    );
});

app.get("/profile/edit", (req, res) => {
    db.getProfile(req.session.userId)
        .then(result => {
            res.render("edit", {
                first: result[0].first,
                last: result[0].last,
                email: result[0].email,
                age: result[0].age,
                city: result[0].city,
                url: result[0].url,
                layout: "main"
            });
        })
        .catch(err => {
            console.log("you get an error: ", err);
            res.redirect("/profile");
        });
});

app.post("/profile/edit", (req, res) => {
    let requrl = req.body.url;
    let requrl1;
    if (requrl === "") {
        requrl1 = requrl;
    } else {
        if (requrl.startsWith("https://") || requrl.startsWith("http://")) {
            requrl1 = requrl;
        } else {
            requrl = "http://" + requrl;
            requrl1 = requrl;
        }
    }

    if (req.body.age == "") {
        req.body.age = null;
    }
    if (!req.body.password) {
        Promise.all([
            db.updateUser(
                req.session.userId,
                req.body.first,
                req.body.last,
                req.body.email
            ),
            db.updateBio(
                req.session.userId,
                req.body.age,
                req.body.city,
                requrl1
            )
        ])
            .then(() => {
                res.redirect("/petition");
            })
            .catch(error => {
                console.log("Email failed: ", error);
                db.getProfile(req.session.userId).then(result => {
                    res.render("edit", {
                        first: result[0].first,
                        last: result[0].last,
                        email: result[0].email,
                        age: result[0].age,
                        city: result[0].city,
                        url: result[0].url,
                        error: "error",
                        layout: "main"
                    });
                });
            });
    } else {
        hash(req.body.password).then(hash => {
            Promise.all([
                db.updateUserPass(
                    req.session.userId,
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                ),
                db.updateBio(
                    req.session.userId,
                    req.body.age,
                    req.body.city,
                    requrl1
                )
            ])
                .then(() => {
                    res.redirect("/petition");
                })
                .catch(error => {
                    console.log("Email failed: ", error);
                    db.getProfile(req.session.userId).then(result => {
                        res.render("edit", {
                            first: result[0].first,
                            last: result[0].last,
                            email: result[0].email,
                            age: result[0].age,
                            city: result[0].city,
                            url: result[0].url,
                            error: "error",
                            layout: "main"
                        });
                    });
                });
        });
    }
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main"
    });
});

app.post("/login", (req, res) => {
    db.getHash(req.body.email)
        .then(result => {
            compare(req.body.password, result[0].password)
                .then(match => {
                    if (match) {
                        req.session.userId = result[0].id;
                        db.getSignature(result[0].id)
                            .then(sig => {
                                req.session.signatureId = sig.rows[0].id;
                                res.redirect("/petition/signed");
                            })
                            .catch(err => {
                                console.log(err);
                                res.redirect("/petition");
                            });
                        req.session.loggedIn = true;
                    } else {
                        res.render("login", {
                            error1: "error",
                            layout: "main"
                        });
                    }

                })
                .catch(e => {
                    console.log(e);
                    res.render("login", {
                        error: "error",
                        layout: "main"
                    });
                });
        })
        .catch(e => {
            console.log(e);
            res.render("login", {
                error: "error",
                layout: "main"
            });
        });
});

app.get("/petition", (req, res) => {
    if (req.session.loggedIn) {
        if (req.session.signatureId) {
            res.redirect("/petition/signed");
        } else {
            res.render("welcome", {
                name: "Vlad",
                layout: "main"
            });
        }
    } else {
        res.redirect("/register");
    }
});

app.post("/petition", (req, res) => {
    db.addSignature(req.body.sig, req.session.userId)
        .then(id => {
            req.session.signatureId = id;
            res.redirect("/petition/signed");
        })
        .catch(err => {
            console.log("it didnt insert because:", err);
            res.render("welcome", {
                error: "error"
            });
        });
});

app.get("/petition/signed", (req, res) => {
    db.getSignature(req.session.userId)
        .then(sig => {
            res.render("signed", {
                sig: sig.rows[0].sig,
                layout: "main"
            });
        })
        .catch(err => {
            console.log("catch running signed", err);
            res.redirect("/petition");
        });
});

app.post("/petition/signed", (req, res) => {
    db.deleteSignature(req.session.userId);
    req.session.signatureId = null;
    res.redirect("/petition");
});

app.get("/petition/signers", (req, res) => {
    let signers = [];
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        if (req.session.userId) {
            db.getSigners()
                .then(result => {
                    for (let i = 0; i < result.length; i++) {
                        signers.push({
                            first: capitalize.toTitleCase(result[i].first),
                            last: capitalize.toTitleCase(result[i].last),
                            age: result[i].age,
                            city: capitalize.toTitleCase(result[i].city),
                            url: result[i].url
                        });
                    }
                    return signers;
                })
                .then(signers => {
                    res.render("signers", {
                        layout: "main",
                        signers: signers,
                        first: signers.first,
                        last: signers.last
                    });
                });
        } else {
            res.redirect("/petition");
        }
    }
});

app.get("/petition/signers/:city", (req, res) => {
    let signerscity = [];
    if (!req.session.signatureId) {
        res.redirect("/petition");
    } else {
        db.getSignersByCity(req.params.city)
            .then(result => {
                for (let i = 0; i < result.length; i++) {
                    signerscity.push({
                        first: capitalize.toTitleCase(result[i].first),
                        last: capitalize.toTitleCase(result[i].last),
                        age: result[i].age,
                        url: result[i].url
                    });
                }
                return signerscity;
            })
            .then(signerscity => {
                res.render("city", {
                    layout: "main",
                    signers: signerscity,
                    first: signerscity.first,
                    last: signerscity.last,
                    age: signerscity.age,
                    url: signerscity.url,
                    city: req.params.city
                });
            });
    }
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/register");
});

if (require.main === module) {
    app.listen(process.env.PORT || 8080, () => {
        console.log("my express server is running");
    });
}
