--- load with 
--- sqlite3 database.db < schema.sql

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(20) NOT NULL,
    numkills int
);