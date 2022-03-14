const express = require('express');
const fs = require('fs');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const ical = require('node-ical');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("views/public"));
app.use(cookieParser());

app.set('view engine', 'pug');
app.set('views', 'views/templates');

// Defining various server constants
const PORT = 80;
const oneDay = 1000 * 60 * 60 * 24;

// Defining regex for input checking of register process
const reName = "^(?=.{1,20})[a-z A-Z]+-?_?[a-z A-Z]+?$";
const reUsername = "^[a-z A-Z]+-?_?[a-z A-Z]+?$";
const rePassword = "^(?=.*?[0-9])(?=.+?[!#,+-_?]).{8,}$";
const reComment = "^.{0,100}$";

// Creating session
app.use(sessions({
    secret: "8304c4f5-8f6f-445a-8669-379d41e35003",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

/** Class representing a user. */
class User {
    /**
     * Creates a user
     *
     * @param {String} firstname - First name of the user
     * @param {String} lastname - Last name of the user
     * @param {String} username - Unique Username of the user
     * @param {String} password - Password of the user
     * @param {String} sex - Sex of the user male/female
     * @param {String} focus - focus of the user
     * @param {String} comment - Custom comment of the user
     * @param {String} tos - Accepted the TOS on/off
     */
    constructor(firstname, lastname, username, password, sex, focus, comment, tos) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.password = password;
        this.sex = sex;
        this.focus = focus;
        this.comment = comment;
        this.tos = tos;
    }
}

/**
 * Class representing a Module
 */
class Module {
    /**
     * Creates a module
     *
     * @param {Allgemein} allgemein - general properties
     * @param {Pruefungsformen} pruefungsformen - exam modalities
     * @param {Lerninhalt[]} lerninhalte - course content
     * @param {Workload} workload - workload
     * @param {Qualifikationsziele} qualifikationsziele - qualification goals
     * @param {?String} voraussetzungen - prerequisites
     * @param {Array.<String>} literatur - literature recommended
     * @param {?Besonderheit[]} besonderheiten - special features about the course
     */
    constructor(
        allgemein,
        pruefungsformen,
        lerninhalte,
        workload,
        qualifikationsziele,
        voraussetzungen,
        literatur,
        besonderheiten
    ) {
        this.allgemein = allgemein;
        this.pruefungsformen = pruefungsformen;
        this.lerninhalte = lerninhalte;
        this.workload = workload;
        this.qualifikationsziele = qualifikationsziele;
        this.voraussetzungen = voraussetzungen;
        this.literatur = literatur;
        this.besonderheiten = besonderheiten;
    }
}

/**
 * Class representing general properties od a module
 */
class Allgemein {
    /**
     * Create an object for general attributes of a module
     *
     * @param {String} name - name
     * @param {String} ganzer_name - full name
     * @param {String} modulnummer - modle identifier
     * @param {Number} semester - semester
     * @param {Number} moduldauer - duration
     * @param {String} modulverantwortung - person responsible
     * @param {Array.<String>} sprachen - languages
     * @param {Array.<String>} lehrformen - teaching forms
     * @param {Array.<String>} lehrmethoden - teaching methods
     */
    constructor(
        name,
        ganzer_name,
        modulnummer,
        semester,
        moduldauer,
        modulverantwortung,
        sprachen,
        lehrformen,
        lehrmethoden
    ) {
        this.name = name;
        this.ganzer_name = ganzer_name;
        this.modulnummer = modulnummer;
        this.semester = semester;
        this.moduldauer = moduldauer;
        this.modulverantwortung = modulverantwortung;
        this.sprachen = sprachen;
        this.lehrformen = lehrformen;
        this.lehrmethoden = lehrmethoden;
    }
}

/**
 * Class representing pruefungsformen of a module
 */
class Pruefungsformen {
    /**
     * Create an object for exam modalities
     *
     * @param {String} pruefungsleistung - exam form (e.g. written, oral, project)
     * @param {String} pruefungsumfang - exam scope
     * @param {String} benotung - grading yes/no
     */
    constructor(
        pruefungsleistung,
        pruefungsumfang,
        benotung,
    ) {
        this.pruefungsleistung = pruefungsleistung;
        this.pruefungsumfang = pruefungsumfang;
        this.benotung = benotung;
    }
}

/**
 * Class representing workload of a module
 */
class Workload {
    /**
     * Create an object for workload of a module
     *
     * @param {Number} total - total time
     * @param {Number} praesenz - time in presence
     * @param {Number} selbststudium - repetition time
     * @param {Number} ects - ects worth
     */
    constructor(
        total,
        praesenz,
        selbststudium,
        ects
    ) {
        this.total = total;
        this.praesenz = praesenz;
        this.selbststudium = selbststudium;
        this.ects = ects;
    }
}

/**
 * Class representing goals of a module
 */
class Qualifikationsziele {
    /**
     * Create an object for qualification goals
     *
     * @param {String} fachkompetenz - professional competence
     * @param {String} methodenkompetenz - method competence
     * @param {String} sozialkompetenz - social competence
     * @param {String} handlungskompetenz - action competence
     */
    constructor(
        fachkompetenz,
        methodenkompetenz,
        sozialkompetenz,
        handlungskompetenz
    ) {
        this.fachkompetenz = fachkompetenz;
        this.methodenkompetenz = methodenkompetenz;
        this.sozialkompetenz = sozialkompetenz;
        this.handlungskompetenz = handlungskompetenz;
    }
}

/**
 * Class representing teaching content
 */
class Lerninhalt {
    /**
     * Create an object for teaching content
     *
     * @param {String} einheit - name of the unit
     * @param {Number} praesenzzeit - time spent in presence
     * @param {Number} selbststudium - time spent repeating at home
     * @param {Array.<String>} inhalte - teaching content
     */
    constructor(
        einheit,
        praesenzzeit,
        selbststudium,
        inhalte
    ) {
        this.einheit = einheit;
        this.praesenzzeit = praesenzzeit;
        this.selbststudium = selbststudium;
        this.inhalte = inhalte;
    }
}

/**
 * Class representing a special comment of a module
 */
class Besonderheit {
    /**
     * Create a special info
     *
     * @param {String} name - name(heading)
     * @param {Array.<String>} content - content
     */
    constructor(
        name,
        content
    ) {
        this.name = name;
        this.content = content;
    }
}

/**
 * Get users.json representation
 * @returns {User[]} - A list of all registered users
 */
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

/**
 * Get a user of users.json by username
 * @param username - The unique username of the user to get
 * @returns {User|boolean} - The user object if exists, otherwise false
 */
function getUserByUsername(username) {
    let users = getUsers();
    for (let user of users) {
        if (username === user.username) {
            return user;
        }
    }
    return false;
}

/**
 * Get modules.json representation
 * @returns {Module[]} A JSON representation of the modules
 */
function getModules() {
    if (fs.existsSync("modules.json")) {
        let content = fs.readFileSync("modules.json", 'utf8');
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error(e);
            return [];
        }
    }
    console.log("Modules file doesn't exist!");
    return [];
}

/*
 * REST Endpoint for logging in a user
 */
app.post('/api/login',(req, res) => {
    let username = req.body.username
    let password = req.body.password

    if (getUserByUsername(username)) {
        let user = getUserByUsername(username);
        if (password === user.password) {
            // Username & Password correct
            // Setting session
            req.session.user = user;

            console.log("User " + username + " logged in successfully!");

            res.redirect('/');
            res.end();
            return;
        }
        // Password wrong
        console.log("Invalid Password for " + username);
        res.redirect('/login');
        res.end();
        return;
    }

    // Username incorrect
    console.log("User " + username + " doesn't exist!");
    res.redirect('/login');
    res.end();
});

/*
 * REST Endpoint for registering a user
 */
app.post('/api/register',(req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let username = req.body.username;
    let password = req.body.password;
    let sex = req.body.sex;
    let focus = req.body.focus;
    let comment = req.body.comment;
    let tos = req.body.tos;

    const newUser = new User(firstname, lastname, username, password, sex, focus, comment, tos);

    if (!newUser.firstname.match(reName)) {
        console.log("First Name invalid!")
        res.redirect('/register');
        res.end();
        return;
    }
    if (!newUser.lastname.match(reName)) {
        console.log("Last Name invalid!")
        res.redirect('/register');
        res.end();
        return;
    }
    if (!newUser.username.match(reUsername)) {
        console.log("Username invalid!")
        res.redirect('/register');
        res.end();
        return;
    }
    if (!newUser.password.match(rePassword)) {
        console.log("Password invalid!")
        res.redirect('/register');
        res.end();
        return;
    }
    if (!newUser.comment.match(reComment)) {
        console.log("Comment invalid!")
        res.redirect('/register');
        res.end();
        return;
    }

    if (!tos) {
        console.log("TOS not accepted!")
        res.redirect('/register');
        res.end();
        return;
    }

    if (getUserByUsername(username)) {
        console.log("User '" + newUser.username + "' already exists");
        res.redirect('/register');
        res.end();
        return;
    }

    let users = getUsers();
    users.push(newUser);
    console.log("Created new user: " + newUser.username);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 4));

    res.redirect('/login');
    res.end();
});

/*
 * Rest Endpoint to deliver login page
 */
app.get('/login',(req,res) => {
    res.render("login", {
        user: req.session.user
    });
    res.end();
});

/*
 * Rest Endpoint to deliver register page
 */
app.get('/register',(req,res) => {
    res.render("register");
    res.end();
});

/*
 * REST endpoint for logging a user out and destroying the session
 * Redirects to landing page afterwards
 */
app.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
    res.end();
});

/*
 * Rest Endpoint to deliver landing page if browser attempts get at root level
 */
app.get('/', (req, res) => {
    res.render("home");
    res.end();
})

/*
 * Rest Endpoint to deliver modules page
 */
app.get('/modules', (req, res) => {
    res.render("modules");
    res.end();
})

/*
 * Rest Endpoint to deliver module pages dynamically
 */
app.get('/modules/:module', (req, res) => {
    const modules = getModules();

    if (modules[req.params.module] === undefined){
        res.sendStatus(404);
        res.end();
        return;
    }

    res.render("module", {
        module: modules[req.params.module]
    });
})

/*
 * Rest Endpoint to deliver calender page
 */
app.get('/calendar', (req, res) => {
    const events = ical.sync.parseFile('TIM21.ics');

    res.render("calendar", {
        events: events
    });
    res.end();
})

//Start listen to requests
app.listen(PORT, function() {
    console.log("Server is listening on port " + PORT);
});