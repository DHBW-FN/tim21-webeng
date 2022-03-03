const express = require('express');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views/public"));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', 'views/template');

const PORT = 80;
const oneDay = 1000 * 60 * 60 * 24;

const reName = "^(?=.{1,20})[a-z A-Z]+-?_?[a-z A-Z]+?$";
const reUsername = "^[a-z A-Z]+-?_?[a-z A-Z]+?$";
const rePassword = "^(?=.*?[0-9])(?=.+?[!#,+-_?]).{8,}$";
const reComment = "^.{0,100}$";

app.use(sessions({
    secret: "8304c4f5-8f6f-445a-8669-379d41e35003",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

class User {
    constructor(firstname, lastname, username, password, sex, interests, comment, tos) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.sex = sex;
        this.interests = interests;
        this.comment = comment;
        this.tos = tos;
    }
}

function getUsers() {
    if (fs.existsSync("users.json")) {
        let content = fs.readFileSync("users.json", 'utf8');
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    console.log("Users file doesn't exist!");
    return [];
}

function getUserByUsername(username) {
    let users = getUsers();
    for (let user of users) {
        if (username === user.username) {
            return user;
        }
    }
    return false;
}


app.post('/api/login',(req, res) => {
    console.log(req.session.userid);
    let username = req.body.username
    let password = req.body.password

    if (getUserByUsername(username)) {
        let user = getUserByUsername(username);
        if (password === user.password) {
            // Username & Password correct
            // Setting session
            req.session.userid = username;

            console.log("User " + username + " logged in successfully!");

            res.redirect('/');
            res.end();
            return;
        }
        // Password wrong
        console.log("Invalid Password for " + username);
        res.redirect('login');
        res.end();
        return;
    }

    // Username incorrect
    console.log("User " + username + " doesn't exist!");
    res.redirect('login');
    res.end();
});

app.post('/api/register',(req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let sex = req.body.sex;
    let interests = req.body.interests;
    let comment = req.body.comment;
    let tos = req.body.tos;

    const newUser = new User(firstname, lastname, username, password, sex, interests, comment, tos);

    if (!newUser.firstname.match(reName)) {
        console.log("First Name invalid!")
        res.redirect('register');
        res.end();
        return;
    }
    if (!newUser.lastname.match(reName)) {
        console.log("Last Name invalid!")
        res.redirect('register');
        res.end();
        return;
    }
    if (!newUser.username.match(reUsername)) {
        console.log("Username invalid!")
        res.redirect('register');
        res.end();
        return;
    }
    if (!newUser.password.match(rePassword)) {
        console.log("Password invalid!")
        res.redirect('register');
        res.end();
        return;
    }
    if (!newUser.comment.match(reComment)) {
        console.log("Comment invalid!")
        res.redirect('register');
        res.end();
        return;
    }

    if (!tos) {
        console.log("TOS not accepted!")
        res.redirect('register');
        res.end();
        return;
    }

    if (getUserByUsername(username)) {
        console.log("User '" + newUser.username + "' already exists");
        res.redirect('register');
        res.end();
        return;
    }

    let users = getUsers();
    users.push(newUser);
    console.log("Created new user: " + newUser.username);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 4));

    res.redirect('login');
    res.end();
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
    res.end();
});

//Start listen to requests
app.listen(PORT, function() {
    console.log("server is listening on port: " + PORT);
});