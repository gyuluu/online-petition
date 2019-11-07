DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INT,
    city VARCHAR(100),
    url VARCHAR(300),
    user_id INT REFERENCES users(id) NOT NULL UNIQUE
);
