const express = require('express');
const app = express();
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require("passport");
const request = require('request');

//links to css file
app.use(express.static(__dirname + '/public'));

var User;
var isNewUser = false;
var googleUser = false;

const initializePassport = require('./passportConfig')

initializePassport(passport);

const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/public'));

app.use(
    session({
        secret: 'secret',

        resave: false,

        saveUninitialized: false
    })
);

app.use(express.static(__dirname + './public/css'));

app.use(passport.initialize());
app.use(passport.session())
app.use(flash());

app.get('/', function(req, res, next) {
    res.render('captcha');
});

app.get('/home', function(req, res) {
    /*app.get('/', function (req, res) {
        res.render('captcha');
    });

    app.get('/home', checkCaptchaCompleted, function (req, res) {*/
    res.render('index');
});

app.post('/captcha', function(req, res) {
    if (req.body === undefined || req.body === '' || req.body === null) {
        return res.json({ "responseError": "captcha error" });
        /*if(req.body === undefined || req.body === '' || req.body === null)
  {
    return res.json({"responseError" : "captcha error"});
  }
  var secretKey = "6LdGcdsaAAAAAP6CFbVhB5E92nyuNmlDTvz049L8";
 
  const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.socket.remoteAddress;  
  request(verificationURL,function(error,response,body) {
    body = JSON.parse(body);
    //console.log(body);
    if(body.success) {
        res.redirect('/home');
        captcha = true;
    } else {
      return res.json({"responseError" : "Failed captcha verification"});*/
    }
    var secretKey = "6LdGcdsaAAAAAP6CFbVhB5E92nyuNmlDTvz049L8";

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.socket.remoteAddress;
    request(verificationURL, function(error, response, body) {
        body = JSON.parse(body);
        //console.log(body);
        if (body.success) {
            res.redirect('/home');
        } else {
            return res.json({ "responseError": "Failed captcha verification" });
        }
    });
});

app.get('/users/login', checkAuthenticated, /*checkCaptchaCompleted,*/ (req, res) => {
    res.render('login');
});

app.get('/users/register', checkAuthenticated, /*checkCaptchaCompleted,*/ (req, res) => {
    res.render('register');
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {

    if (googleUser == true) {
        console.log("displaying google user dashboard");
        res.redirect('/googleusers/dashboard');
    } else {
        User = req.user;
        pool.query(
            `SELECT name, biglittle, hobbylist, yr, major, email, numLikes, reputation FROM Users WHERE name != $1;`, [req.user.name],
            (err, results) => {
                if (err) {
                    throw err;
                }
                res.render('dashboard', {
                    User: req.user.name,
                    userData: results.rows,
                    email: User.email
                });
            }
        );
    }
});

app.get('/users/profile', checkNotAuthenticated, (req, res) => {

    if (googleUser == true) {
        pool.query(
            `SELECT * FROM users 
            WHERE email = $1`, [userProfile.emails[0].value],
            function(err, results) {
                if (err) {
                    throw err;
                }
                res.render('profile', {
                    name: results.rows[0].name,
                    biglittle: results.rows[0].biglittle,
                    hobbylist: results.rows[0].hobbylist,
                    yr: results.rows[0].yr,
                    major: results.rows[0].major,
                    email: results.rows[0].email,
                    numLikes: results.rows[0].numlikes
                });
            }
        );
    } else {
        res.render('profile', {
            name: req.user.name,
            biglittle: req.user.biglittle,
            hobbylist: req.user.hobbylist,
            yr: req.user.yr,
            major: req.user.major,
            email: req.user.email,
            numLikes: req.user.numlikes
        });
    }

});

app.get('/users/logout', (req, res) => {
    googleUser = false;
    req.logOut();
    req.flash('success_msg', "You have logged out");
    res.redirect('/users/login');
});

app.post('/users/profile/changeinfo/', checkNotAuthenticated, async(req, res) => {
    let name, hashedPassword, biglittle, hobbies, year, major, email;

    if (req.body.name != "") name = req.body.name;
    else name = req.user.name;
    if (req.body.biglittle != "") biglittle = req.body.biglittle;
    else biglittle = req.user.biglittle
    if (req.body.hobbies != "") hobbies = req.body.hobbies;
    else hobbies = req.user.hobbies;
    if (req.body.year != "") year = req.body.year;
    else year = req.user.year;
    if (req.body.major != "") major = req.body.major;
    else major = req.user.major;
    if (req.body.email != "") email = req.body.email;
    else email = req.user.email;
    if (req.body.password == "") {
        hashedPassword = await bcrypt.hash(req.body.passwordCurrent, 10);
    } else {
        hashedPassword = await bcrypt.hash(req.body.password, 10);
    }

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
    if (googleUser == true) {
        tempEmail = userProfile.emails[0].value;
    }
    if (googleUser == false) {
        tempEmail = User.email;
    }
    if (tempEmail != email) {
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
            if (googleUser == true) {
                userProfile.emails[0].value = email;
                res.redirect('/googleusers/dashboard');
            } else {
                res.redirect('/users/dashboard');
            }
        }
    )
});

app.post('/users/register', async(req, res) => {
    let { name, email, password, password2 } = req.body;

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
        //console.log(hashedPassword);

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
                        `INSERT INTO users (name, email, password, numlikes, reputation) 
                        VALUES ($1, $2, $3, $4, $5) 
                        RETURNING id, password`, [name, email, hashedPassword, 0, "Unknown"],
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

function checkCaptchaCompleted(req, res, next) {
    if (captcha) {
        return next();
    }
    res.redirect('/');
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
        `SELECT name, biglittle, hobbylist, yr, major, email, numLikes, reputation FROM Users WHERE email != $1`, [userProfile.emails[0].value],
        function(err, results) {
            if (err) {
                throw err;
            }
            console.log(results.rows);
            res.render('dashboard', { User: userProfile.displayName, userData: results.rows, email: userProfile.emails[0].value });
        }
    );
});

app.get('/', (req, res) => res.send("error logging in"));

app.get('/users/setpw', checkNotAuthenticated, (req, res) => {
    res.render('setpw');
});

passport2.serializeUser(function(user, cb) {
    cb(null, user);
});

passport2.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { google } = require('googleapis');
const { restart } = require('nodemon');
const GOOGLE_CLIENT_ID = "278162699022-vcn0nfdpt3hv4hcrqfgc3nnimvub1qrj.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "q0ij5zfoUX-QeJx3QfbX9fYw";
passport2.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        userProfile = profile;
        var token = userProfile._json.sub;
        var name = userProfile.displayName;
        var email = userProfile.emails[0].value;
        userProfile.id = 100; //dont remove need it

        //console.log(userProfile.id); //comment this out when finished
        //console.log(token); //comment this out when finished

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
                        `INSERT INTO users (name, email, external_id, numlikes, reputation) 
                        VALUES ($1, $2, $3, $4, $5) 
                        RETURNING id, external_id`, [name, email, token, 0, "Unknown"],
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
    function(req, res) {
        // Successful authentication, redirect success.
        console.log("Successful Google Login");
        googleUser = true;
        if (isNewUser == true) {
            res.redirect('/users/setpw');
        } else {
            res.redirect('/googleusers/dashboard');
        }
    });

app.post('/users/setpassword', async(req, res) => {
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
        //console.log(hashedPassword);

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


app.get('/search', async function(req, res) {

    const { keyword } = req.query;

    pool.query(
        `SELECT name, biglittle, hobbylist, yr, major, email, numLikes FROM Users WHERE biglittle LIKE $1 or name LIKE $2;`, ['%' + keyword + '%', '%' + keyword + '%'],
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

    pool.query(
        'SELECT name, biglittle, hobbylist, yr, major, email, reputation, numLikes FROM USERS WHERE email = $1;', [req.query.prof],
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


app.get('/showuser/like', function(req, res) {

    let reputation = "Unknown";
    var numLikes;
    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }
    pool.query(
        `INSERT INTO like_users(email, user_liked_email)
        VALUES($1, $2)`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }

        }
    )

    pool.query(
        'SELECT numlikes FROM USERS WHERE email = $1;', [req.query.email],
        (err, results) => {
            if (err) {
                throw err;
            }
            numLikes = results.rows[0].numlikes;
            numLikes++;

            if (numLikes == 5) {
                reputation = "Gaining Attraction"
            }
            if (numLikes == 10) {
                reputation = "Popular"
            }
            if (numLikes >= 15) {
                reputation = "Very Popular"
            }

            pool.query(
                `UPDATE users 
                SET
                numlikes = $1,
                reputation = $2
                WHERE email = $3;`, [numLikes, reputation, req.query.email],
                (err) => {
                    if (err) {
                        throw err;
                    }
                }
            );
            console.log("Liked User");
        }
    )
});

app.get('/showuser/unlike', function(req, res) {

    let reputation = "Unknown";
    var numLikes;
    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    //remove from like list
    pool.query(
        `DELETE FROM like_users
        WHERE email = $1 and user_liked_email = $2`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }
        }
    )

    //remove from matches
    pool.query(
        `update users set matches = array_remove(matches, $2) where email = $1;`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log("unmatched");
        }
    )

    pool.query(
        `DELETE FROM messenger WHERE email = $2 AND match_user_email = $1`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log("unmatched: removed messenger from database");
        }
    )

    pool.query(
        `DELETE FROM messenger WHERE email = $1 AND match_user_email = $2`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log("unmatched: removed messenger from database");
        }
    )

    pool.query(
        `update users set matches = array_remove(matches, $1) where email = $2;`, [email, req.query.email], (err, results) => {
            if (err) {
                throw err;
            }
            console.log("unmatched");
        }
    )

    pool.query(
        'SELECT numlikes FROM USERS WHERE email = $1;', [req.query.email],
        (err, results) => {
            if (err) {
                throw err;
            }
            numLikes = results.rows[0].numlikes;
            numLikes--;

            if (numLikes == 5) {
                reputation = "Gaining Attraction"
            }
            if (numLikes == 10) {
                reputation = "Popular"
            }
            if (numLikes >= 15) {
                reputation = "Very Popular"
            }

            pool.query(
                `UPDATE users 
                SET
                numlikes = $1,
                reputation = $2
                WHERE email = $3;`, [numLikes, reputation, req.query.email],
                (err) => {
                    if (err) {
                        throw err;
                    }
                }
            );
            console.log("Unliked User");
        }
    )
});
/*End of search feature*/



/*Start of Checking if user liked a user for like button */
app.get('/getlikes', function(req, res) {
    console.log("Getting like button...");

    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    pool.query(
        `SELECT COUNT(*) FROM like_users A
        WHERE A.email = $1
        AND A.user_liked_email = $2;`, [email, req.query.email],
        (err, results) => {
            if (err) {
                throw err;
            }
            res.send(results.rows[0].count);
        }
    )
});
/*End of Checking if user liked a user for like button */


/*Start of match feature*/
app.get('/checkmatch', function(req, res) {

    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    //checks if both users like each others, output the count, if more than 1 = a match
    pool.query(
        `SELECT COUNT(*)
        FROM like_users A
        JOIN like_users B
        ON A.email = $1
    AND A.user_liked_email = $2
    AND B.email = $2
        AND B.user_liked_email = $1;`, [email, req.query.email],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows[0].count);
            if (results.rows[0].count >= 1) {
                pool.query(

                    'update users set matches = array_append(matches, $2) where email = $1;', [email, req.query.email],
                    (err, results) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Added match into database");
                    }
                )
                pool.query(

                        'update users set matches = array_append(matches, $1) where email = $2;', [email, req.query.email],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Added match into database");
                        }
                    )
                    //creates messenger table
                var obj = {
                    name: "",
                    email: "",
                    text: "",
                    time: ""
                };
                pool.query(

                        'INSERT INTO messenger(email, match_user_email, jsondata) VALUES($1, $2, array[$3]::json[]);', [email, req.query.email, JSON.stringify(obj)],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Created matches messenger instance in database");
                        }
                    )
                    /*(pool.query(

                        'INSERT INTO messenger(email, match_user_email, jsondata) VALUES($2, $1, array[$3]::json[]);', [email, req.query.email, JSON.stringify(obj)],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Created matches messenger instance in database");
                        }
                    )*/
            }
            res.send(results.rows[0].count);
        }
    )

});
/*End of match feature*/


//}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}


/*Start of Chat feature*/

//loads message history
app.get('/getMsg', function(req, res) {

    console.log("Getting message");

    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    pool.query(

        'SELECT jsondata FROM messenger WHERE (email = $1 AND match_user_email = $2) or (email = $2 and match_user_email = $1);', [email, req.query.uEmail],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("Successfully fetched messages");
            res.send(JSON.parse(JSON.stringify(results.rows[0])));
        }
    )

});

app.get('/getinfo', function(req, res) {

    var name;

    if (googleUser == true) {
        name = userProfile.displayName;
    } else {
        name = User.name;
    }
    res.send(name);
});

//inserts text into database
app.post('/insertText', function(req, res) {

    console.log("Inserting message");

    var email;
    var dname;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
        dname = userProfile.displayName;
    } else {
        email = User.email;
        dname = User.name;
    }

    var obj = {
        name: dname,
        email: email,
        text: req.body.text,
        time: req.body.time
    };

    /*pool.query(
        'update messenger set messages = array_append(messages, $1) where email = $2 and match_user_email = $3;'
        , [obj, email, req.body.uEmail],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("inserting message successful")
        }
    )*/

    pool.query(
        /*'update messenger set messages = array_append(messages, $1) where email = $2 and match_user_email = $3;'*/
        /*`update messenger

        /*`update messenger
        set jsondata = jsondata::jsonb || $1;`,[JSON.stringify(obj)]*/


        `update messenger set jsondata = array_append(jsondata, $3) where (email = $1 and match_user_email = $2) or (email = $2 and match_user_email = $1);`, [email, req.body.uEmail, JSON.stringify(obj)],
        (err, results) => {
            if (err) {
                throw err;
            }
            console.log("inserting message successful")
                //console.log(req);
                //console.log(JSON.parse(JSON.stringify(obj)));
        }
    )
});

//gets matches to append to matchlist
app.get('/getMatches', function(req, res) {

    console.log("Getting match list");

    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    pool.query(
        `SELECT matches FROM users WHERE email = $1;`, [email],
        (err, results) => {
            if (err) {
                throw err;
            }
            res.send(results.rows);
        }
    )
});

//gets liked user info
app.get('/getUserInfo', function(req, res) {

    console.log("Getting user info to display match list");

    var email;

    if (googleUser == true) {
        email = userProfile.emails[0].value;
    } else {
        email = User.email;
    }

    pool.query(
            `SELECT name, email, numlikes FROM users WHERE email = $1;`, [req.query.email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                res.send(results.rows[0]);
            }
        )
        /*);   
        res.redirect("/users/dashboard");*/
});
/*End of Chat feature*/
/**/