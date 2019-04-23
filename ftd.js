var port = 8000;
var express = require('express');
var app = express();
var history = [];

// http://www.sqlitetutorial.net/sqlite-nodejs/connect/
const sqlite3 = require('sqlite3').verbose();

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

var db = new sqlite3.Database('db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.use(express.static('static-content'));

//login api
app.post('/api/login/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log("User Attempting to Login: ", username, password);

    let sql = "SELECT * FROM users WHERE username =  '" + username + "' AND password = '" + password + "';";
    db.all(sql, [], (err, rows) => {
        var result = {};
        var x = 0;
        if (err) {
            result["error"] = err.message;
        } else {
            rows.forEach((row) => {
                res.status(200).send('Success');
                x = 1;
            });
        }
        if (x == 0) {
            res.status(400).send('Invalid authentication');
        }

    });
});

//register api
app.post('/api/register/', function(req, res) {
    var username = req.body.user;
    var password = req.body.pass;

    console.log("User Attempting to Register: ", username, password);

    let sql = "SELECT * FROM users WHERE username =  '" + username + "';";
    db.all(sql, [], (err, rows) => {
        var result = {};
        result["users"] = [];
        var x = 0;
        if (err) {
            result["error"] = err.message;
        } else {
            rows.forEach((row) => {
                res.status(400).send('Already Exists');
                x = 1;
            });

            if (x == 0) {
                let sql1 = "INSERT INTO users VALUES ('" + username + "', '" + password + "', 0);";
                db.run(sql1, [], function(err) {
                    var result = {};
                    result["users"] = [];
                    if (err) {
                        result["error"] = err.message;
                    } else {
                        res.status(200).send('Success');
                    }
                });
            }
        }
    });
});

//authentication api
app.post('/api/authen/', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    console.log("Authenticating: ", username, password);

    let sql = "SELECT * FROM users WHERE username =  '" + username + "' AND password = '" + password + "';";
    db.all(sql, [], (err, rows) => {
        var result = {};
        var x = 1;
        if (err) {
            result["error"] = err.message;
        } else {
            rows.forEach((row) => {
                res.status(200).send('Success');
                x = 0;
            });
        }

        if (x == 1) {
            res.status(401).send('Unauthorized Access');
        }

    });
});

//update Kill count
app.post('/api/updateKills/', function(req, res) {
    var username = req.body.username;
    var kills = req.body.numkills;
    console.log("Updating Kills: ", username);

    let sql = "UPDATE users SET numkills = " + kills + " WHERE username =  '" + username + "';";
    db.run(sql, [], function(err) {
        var result = {};
        result["users"] = [];
        if (err) {
            result["error"] = err.message;
        } else {
            res.status(200).send('Success');
        }
    });
});

//get Kill count
app.get('/api/getKills/', function(req, res) {
    var username = req.query.username;
    console.log("User Attempting to get Kill Count: ", username);

    let sql = "SELECT * FROM users WHERE username =  '" + username + "';";
    db.all(sql, [], (err, rows) => {
        var result = {};
        result["kills"] = [];
        if (err) {
            result["error"] = err.message;
        } else {
            rows.forEach((row) => {
                result["kills"].push(row);
            });
        }
        res.json(result);
    });
});


//get Highscores
app.get('/api/getHighscores/', function(req, res) {
    let sql = "SELECT username, numkills FROM users ORDER BY numkills DESC LIMIT 10;";
    db.all(sql, [], (err, rows) => {
        var result = {};
        result["highscores"] = [];
        if (err) {
            result["error"] = err.message;
        } else {
            rows.forEach((row) => {
                result["highscores"].push(row);
            });
        }
        res.json(result);
    });
});

//change password api call
app.post('/api/changePass/', function(req, res) {
    var username = req.body.username;
    var newpass = req.body.newpass;

    let sql1 = "UPDATE users SET password = '" + newpass + "' WHERE username =  '" + username + "';";

    db.run(sql1, [], function(err) {
        var result = {};
        result["output"] = [];
        if (err) {
            result["error"] = err.message;
        }
        res.status(200).send('Success');
    });
});

app.listen(port, function() {
    console.log('Server has started listening on port ' + port);
});