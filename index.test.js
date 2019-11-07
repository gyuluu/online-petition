// index.test.js
const supertest = require("supertest");
const { app } = require("./index");
// we're requiring the cookie session MOCK, not the NPM package cookie-session
const cookieSession = require("cookie-session");

// test("GET /welcome, when fakeCookieForDemo cookie is sent, receives p tag as response", () => {
//     // here we are sending a cookie called 'fakeCookieForDemo' as part of the request and in index.js will be attached to req.session
//     cookieSession.mockSessionOnce({
//         fakeCookieForDemo: true
//     });
//
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             // expect(res.statusCode).toBe(200);
//             expect(res.text).toBe("<p>wow you have a cookie</p>");
//         });
// });

// test("POST /welcome sets wenttowelcome cookie", () => {
//     // cookie variable will store any information that's written to a cookie by the post welcome route in index.js
//     const cookie = { loggedIn: true };
//     // tell cookie session mock that it should treat my cookie variable as req.session my cookie. Meaning thaat any information index.js writes to a cookie should be written to my cookie variable
//
//     cookieSession.mockSessionOnce(cookie);
//     // make post welcome request to server using supertest
//     return supertest(app)
//         .post("/welcome")
//         .then(res => {
//             // down here if we log cookie we that data was written to it! when the server does req.session.something = someVal, that key-value pair gets stored in our cookie variable!
//             console.log(res);
//             console.log(cookie);
//             expect(res.statusCode).toBe(302);
//             // expect(res.headers.location).toBe("/home");
//             expect(cookie.wentToWelcome).toBe("hell yea");
//         });
// });

test("GET /petition redirects to /register when a user is logged out", () => {
    const cookie = { loggedIn: false };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/petition")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.headers.location).toBe("/");
        });
});

test("GET /register redirects to /petition when a user is logged in", () => {
    const cookie = { loggedIn: true };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/register")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /login redirects to /petition when a user is logged in", () => {
    const cookie = { loggedIn: true };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/login")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /petition redirects to /petition/signed when a user is logged in and has signed the petition", () => {
    const cookie = { loggedIn: true, signatureId: true };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/petition")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition/signed");
        });
});

test("POST /petition redirects to /petition/signed when a user is logged in and has signed the petition", () => {
    const cookie = { loggedIn: true, signatureId: true };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .post("/petition")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition/signed");
        });
});

test("GET /petition/signed redirects to /petition when a user is logged in and has not signed the petition", () => {
    const cookie = { loggedIn: true, signatureId: false };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/petition/signed")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

test("GET /petition/signers redirects to /petition when a user is logged in and has not signed the petition", () => {
    const cookie = { loggedIn: true, signatureId: false };
    cookieSession.mockSessionOnce(cookie);
    return supertest(app)
        .get("/petition/signers")
        .then(res => {
            // console.log(res);
            // console.log(cookie);
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/petition");
        });
});

// test("GET /home returns 200 status code", () => {
//     return supertest(app)
//         .get("/home")
//         .then(res => {
//             expect(res.statusCode).toBe(200);
//         });
// });
//
// test("GET /welcome causes redirect", () => {
//     return supertest(app)
//         .get("/welcome")
//         .then(res => {
//             expect(res.statusCode).toBe(302);
//             expect(res.headers.location).toBe("/home");
//         });
// });
