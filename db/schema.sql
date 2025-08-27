-- Drop a finances database if it exists, instantiate a new one, and set is as the default --
DROP DATABASE IF EXISTS finances_db;
CREATE DATABASE finances_db;

USE finances_db;

-- First table is the category table, with a primary key field in ID 
CREATE TABLE category (
    id INT AUTO_INCREMENT,
    name VARCHAR(30),
    PRIMARY KEY (id)
);

-- Second table is the budget table, with a primary key field in ID and a foreign key field in category_id that links to the category table
CREATE TABLE budget (
    id INT AUTO_INCREMENT,
    budget_limit DECIMAL,
    category_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (category_id)
    REFERENCES category(id)
    ON DELETE SET NULL
);

-- Third table is the expense table, with a primary key field in ID and a foreign key field in category_id that links to the category table
CREATE TABLE expense (
    id INT AUTO_INCREMENT,
    amount DECIMAL,
    description VARCHAR(30),
    category_id INT,
    entry_date DATE NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (category_id)
    REFERENCES category(id)
    ON DELETE SET NULL
);
