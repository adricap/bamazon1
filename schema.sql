DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;
use bamazonDB;

CREATE TABLE products (
    itemID INT NOT NULL AUTO_INCREMENT,
    productName VARCHAR(100) NOT NULL,
    departmentName VARCHAR(100),
    price DECIMAL(10,2), 
    stockQty INT NULL,
    PRIMARY KEY (itemID)
);

SELECT * FROM products;