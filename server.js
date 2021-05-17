const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");

var User;
var isNewUser = false;
var googleUser = false;
var sessionpw;

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
    User = req.user;
    res.render('dashboard', { user: req.user.name });
    username = req.user.name; 
    major = req.user.major;
    year = req.user.yr;
});

app.get('/users/profile', checkNotAuthenticated, (req, res) => {

    if(googleUser == true) {
        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [userProfile.emails[0].value], function (err, results) {
            if (err) {
                throw err;
            }
            res.render('profile', { name: results.rows[0].name, 
                biglittle: results.rows[0].biglittle,
                hobbylist: results.rows[0].hobbylist,
                yr: results.rows[0].yr,
                major: results.rows[0].major,
                email: results.rows[0].email
              });
        }
        );
    }
    else {
        res.render('profile', { name: req.user.name, 
            biglittle: req.user.biglittle,
            hobbylist: req.user.hobbylist,
            yr: req.user.yr,
            major: req.user.major,
            email: req.user.email
          });
    }

});

app.get('/users/logout', (req, res) => {
    googleUser = false;
    req.logOut();
    req.flash('success_msg', "You have logged out");
    res.redirect('/users/login');
});

app.post('/users/profile/changeinfo/', checkNotAuthenticated, async (req, res) => {
    let name, hashedPassword, biglittle, hobbies, year, major, email;

    if(req.body.name != "") name = req.body.name;
    else name = req.user.name;
    if(req.body.biglittle != "")  biglittle = req.body.biglittle; 
    else biglittle = req.user.biglittle 
    if(req.body.hobbies != "") hobbies = req.body.hobbies; 
    else hobbies = req.user.hobbies;
    if(req.body.year != "") year = req.body.year; 
    else year = req.user.year;
    if(req.body.major != "") major = req.body.major;
    else major = req.user.major;
    if(req.body.email != "") email = req.body.email; 
    else email = req.user.email;
    if(req.body.password != "") hashedPassword = await bcrypt.hash(req.body.password, 10);
    else hashedPassword = req.user.password; 

    /*let errors = [];

    if(biglittle != "Big" && biglittle != "Little") {
        errors.push({ message: "Please enter Big or Little" })
        res.render('profile', { 
            name: name;
            errors });
    }
    
    pool.query(
        `SELECT * FROM users 
        WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err;
            }
            //console.log(results.rows);
            if (results.rows.length > 0) {
                errors.push({ message: "email already registered" });
                res.render('profile', { errors });
            }
        }
    )*/

    var tempEmail;
    if(googleUser == true) {
        tempEmail = userProfile.emails[0].value;
    }
    if(googleUser == false) {
        tempEmail = User.email;
    }
    if(tempEmail != email) {
        pool.query(
            'UPDATE users SET external_id = 0 WHERE email = $1;', [tempEmail], (err, results) => {
                if (err) {
                    throw err;
                }
            }
        );
    }
        pool.query(
        `UPDATE users
         SET 
            name = $1, 
            biglittle = $2, 
            hobbylist = $3, 
            yr = $4, 
            major = $5, 
            email = $6, 
            password = $7
            WHERE email = $8;
            `, [name, biglittle, hobbies, year, major, email, hashedPassword, tempEmail], (err, results) => {
                if (err) {
                    throw err;
                }
                //console.log(results.rows);
                req.flash('success_msg', "Profile change complete!");
                if(googleUser == true) {
                    userProfile.emails[0].value = email;
                    res.redirect('/googleusers/dashboard');
                }
                else {
                    res.redirect('/users/dashboard');
                }
            }
        )
});

app.post('/users/register', async (req, res) => {
    let { name, email, password, password2 } = req.body;

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
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" })
    }

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
                    `INSERT INTO users (name, email, password) 
                        VALUES ($1, $2, $3) 
                        RETURNING id, password`, [name, email, hashedPassword],
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

    pool.query(
        `SELECT * FROM users 
        WHERE email = $1`, [userProfile.emails[0].value], function (err, results) {
        if (err) {
            throw err;
        }
        console.log(results.rows);
        res.render('dashboard', {user: results.rows[0].name});
    }
    );
});

app.get('/', (req, res) => res.send("error logging in"));

app.get('/users/setpw', checkNotAuthenticated, (req, res) => {
    res.render('setpw');
});

passport2.serializeUser(function (user, cb) {
    cb(null, user);
});

passport2.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { google } = require('googleapis');
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

        console.log(userProfile.id);//comment this out when finished
        console.log(token);//comment this out when finished

        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                isNewUser = false;
                return done(null, userProfile);
            } else {
                isNewUser = true;
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
        googleUser = true;
        if(isNewUser == true) {
            res.redirect('/users/setpw');
        }
        else {
            res.redirect('/googleusers/dashboard');
        }
});

app.post('/users/setpassword', async (req, res) => {
    var name = userProfile.displayName;
    var email = userProfile.emails[0].value;
    let { password, password2 } = req.body;

    let errors = [];
    if (!password || !password2) {
        errors.push({ message: "Please enter all fields" })
    }
    if (password.length < 6) {
        errors.push({ message: "Password should be at least 6 characters" });
    }
    if (password != password2) {
        errors.push({ message: "Passwords do not match" });
    }
    if (errors.length > 0) {
        res.render('setpw', { errors });
    } else {
        //Form validation has passed 
        let hashedPassword = await bcrypt.hash(password, 10);
        sessionpw = hashedPassword;
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);

            if (results.rows.length > 0) {
                //change pw with sql here since acc is found
                pool.query(
                    'UPDATE users SET password = $2 WHERE email = $1 ;', [email, hashedPassword],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }

                        console.log(results.rows);
                        req.flash('success_msg', "Password successfully set.");
                        res.redirect('/googleusers/dashboard');
                    }
                )
            } 
            }
        );
    }
});

/*End of Google Auth */


/*Start of search feature*/
//searches and filters users based on name/username


app.get('/search',async function(req,res){  

    const {keyword} = req.query;

    pool.query (
        `SELECT name, biglittle, hobbylist, yr, major, email FROM Users WHERE biglittle LIKE $1 AND 
        (yr = $2 AND major = $3 AND hobbylist LIKE $4) OR (yr != $2 AND major != $3 AND hobbylist NOT LIKE $4);`
        ,['%'+keyword+'%', req.user.yr, req.user.major, '%'+req.user.hobbylist+'%'], 
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("===Result of users:===");
            console.log(results.rows);
            console.log("===End of Results===");
            res.render('searchresults', {
                userData: results.rows
            });
        }
    )
});

app.get('/showuser', function(req, res) {
    console.log("Showing user info...");

    pool.query (
        'SELECT name, biglittle, hobbylist, yr, major, email from USERS WHERE email = $1;', [req.query.prof], 
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("===Result of users:===");
            console.log(results.rows);
            console.log("===End of Results===");
            res.render('displaySearchedUser', {
                userData: results.rows
            });
        }
    )

});

/*End of search feature*/