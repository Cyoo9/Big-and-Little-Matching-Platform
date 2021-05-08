//import { google } from 'googleapis';

const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");

const initializePassport = require('./passportConfig')

initializePassport(passport);


const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'secret',

        resave: false,

        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session())
app.use(flash());


app.get('/', (req, res) => {
    res.render('index')
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render('login');
});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render('register');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user.name });
});

app.get('/users/logout', (req, res) => {
    req.logOut();
    req.flash('success_msg', "You have logged out");
    res.redirect('/users/login');
});

app.post('/users/register', async (req, res) => {
    let { name, biglittle, hobbylist, yr, major, email, password, password2 } = req.body;

    /*console.log({
        name,
        biglittle,
        hobbylist,
        yr,
        major,
        email,
        password,
        password2
    });*/

    let errors = [];
    if (!name || !biglittle || !hobbylist || !yr || !major || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" })
    }
    //if(biglittle != "Big" || biglittle != "Little") {
       // errors.push({ message: "Please enter Big or Little"});
    //}
    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }
    if (password != password2) {
        errors.push({ message: "Passwords do not match" });
    }
    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        //Form validation has passed 
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                errors.push({ message: "email already registered" });
                res.render('register', { errors });
            } else {
                pool.query(
                    'SELECT count(*) FROM users'
                )
                pool.query(
                    `INSERT INTO users (name, biglittle, hobbylist, yr, major, email, password) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7) 
                        RETURNING id, password`, [name, biglittle, hobbylist, yr, major, email, hashedPassword],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }

                        console.log(results.rows);
                        req.flash('success_msg', "You are now registered. Please login.");
                        res.redirect('/users/login');
                    }
                )
            }
        }
        );
    }
});

app.post('/users/login',
    passport.authenticate('local', {
        successRedirect: "/users/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
    })
);

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/dashboard');
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/users/login')
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});




/*  Google AUTH  */
const passport2 = require('passport');
var userProfile;

app.use(passport2.initialize());
app.use(passport2.session());

app.get('/googleusers/dashboard', (req, res) => {
    res.render('dashboard', { user: userProfile.displayName });
});

app.get('/', (req, res) => res.send("error logging in"));

passport2.serializeUser(function (user, cb) {
    cb(null, user);
});

passport2.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = "278162699022-vcn0nfdpt3hv4hcrqfgc3nnimvub1qrj.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "q0ij5zfoUX-QeJx3QfbX9fYw";
passport2.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        userProfile = profile;
        var token = userProfile._json.sub;
        var name = userProfile.displayName;
        var email = userProfile.emails[0].value;
        userProfile.id = 100;//dont remove need it

        console.log(userProfile.id);//
        console.log(token);//

        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                return done(null, userProfile);
            } else {
                pool.query(
                    'SELECT count(*) FROM users'
                )
                pool.query(
                    `INSERT INTO users (name, email, external_id) 
                        VALUES ($1, $2, $3) 
                        RETURNING id, external_id`, [name, email, token],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }

                        console.log(results.rows);
                        return done(null, userProfile);
                    }
                )
            }
        }
        );
    }
));

app.get('/auth/google',
    passport2.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport2.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect success.
        console.log("Successful Google Login");
        res.redirect('/googleusers/dashboard');
    });
    /*End of Google Auth */