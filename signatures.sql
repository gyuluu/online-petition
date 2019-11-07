DROP TABLE IF EXISTS signatures;
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    sig TEXT NOT NULL CHECK (sig <> ''), 
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
