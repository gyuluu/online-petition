const spicedPg = require("spiced-pg");

// const db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/petition`);

let db;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    const { dbuser, dbpass } = require("../secrets.json");
    db = spicedPg(`postgres:${dbuser}:${dbpass}@localhost:5432/petition`);
}

exports.getProfile = function(user) {
    return db
        .query(
            `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users JOIN user_profiles ON users.id = user_profiles.user_id WHERE users.id = $1`,
            [user]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.updateUser = function(user, first, last, email) {
    return db.query(
        `UPDATE users SET first=$2, last=$3, email=$4 WHERE users.id = $1`,
        [user, first, last, email]
    );
};

exports.updateUserPass = function(user, first, last, email, password) {
    return db.query(
        `UPDATE users SET first=$2, last=$3, email=$4, password=$5 WHERE users.id = $1`,
        [user, first, last, email, password]
    );
};

exports.updateBio = function(user, age, city, url) {
    return db.query(
        `INSERT INTO user_profiles (user_id, age, city, url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE SET age = $2, city = $3, url = $4`,
        [user, age, city, url]
    );
};

exports.getSigners = function() {
    return db
        .query(
            `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON users.id = user_profiles.user_id`
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getSignersByCity = function(city) {
    return db
        .query(
            `SELECT users.first, users.last, user_profiles.age, user_profiles.url FROM signatures JOIN users ON signatures.user_id = users.id JOIN user_profiles ON users.id = user_profiles.user_id WHERE LOWER(user_profiles.city)=LOWER($1)`,
            [city]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.getSignature = function(signature) {
    return db.query(`SELECT sig, id FROM signatures WHERE user_id=$1`, [
        signature
    ]);
};

exports.getHash = function(email) {
    return db
        .query(`SELECT password, id FROM users WHERE email=$1`, [email])
        .then(({ rows }) => {
            return rows;
        });
};

exports.addSignature = function(sig, user_id) {
    return db
        .query(
            `INSERT INTO signatures (sig, user_id)
                VALUES ($1, $2)
                RETURNING id`,
            [sig, user_id]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

exports.addUser = function(first, last, email, password) {
    return db
        .query(
            `INSERT INTO users (first, last, email, password)
                VALUES ($1, $2, $3, $4)
                RETURNING id`,
            [first, last, email, password]
        )
        .then(({ rows }) => {
            return rows[0].id;
        });
};

exports.addBio = function(age, city, url, user_id) {
    return db
        .query(
            `INSERT INTO user_profiles (age, city, url, user_id)
                VALUES ($1, $2, $3, $4)`,
            [age || null, city || null, url || null, user_id]
        )
        .then(({ rows }) => {
            return rows;
        });
};

exports.deleteSignature = function(user) {
    return db.query(`DELETE FROM signatures WHERE user_id=$1`, [user]);
};
