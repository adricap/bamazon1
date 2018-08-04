var mysql = require("mysql");
var inquirer = require("inquirer");
var Tablefy = require("tablefy")

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazonDB"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
});

function readProducts() {
    var table = new Tablefy();
    connection.query("SELECT itemID, productName, departmentName, price FROM products", function (err, res) {
        if (err) throw err;
        table.draw(res);
        shop();
    });
}

function readProduct(itemID, cb) {
    connection.query("SELECT * FROM products WHERE itemID = " + itemID, function (err, res) {
        if (err) throw err;

        if (res.length === 0) {
            cb(null)
        } else {
            cb(res[0])
        }
    });
}

function shop() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        inquirer.prompt([
            {
                name: "itemID",
                type: "input",
                message: "what would you like to buy today? Please enter itemID",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Quantity",
                validate: function (value) {
                    var num = parseInt(value)
                    if (isNaN(num) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            var chosenItem = answer.itemID;
            answer.quantity = parseInt(answer.quantity);
            
            readProduct(chosenItem, function(product) {
                if (product === null) {
                    // TODO: what happens if the ID the user put into the command line is for a product that doesn't exist??
                    // handle that situation here
                }

                if (answer.quantity <= product.stockQty) {
                    newQty = product.stockQty - answer.quantity;
                    connection.query("UPDATE products SET ? WHERE ?", [
                        {
                            stockQty: newQty
                        },
                        {
                            itemID: chosenItem
                        }
                    ], function (error) {
                        if (error) throw err;

                        var totalPrice = parseFloat(product.price).toFixed(2) * answer.quantity

                        console.log("Your order was placed successfully! your total is $" + totalPrice + ".");
                        shop();
                    });
                }
                else {
                    console.log("Insufficient quantity!");
                    connection.end();
                }
            })
        });
    });
}