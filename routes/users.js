var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var Verify = require('./verify');

/* GET users listing. */
router.get('/', Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    User.find({},
        function(err, user) {
            if (err) throw err;
            res.json(user);
        });
});
// user info will be sent as a JSON objsect. 
router.post('/register', function(req, res) {
    // info is parsed to get the info.
    User.register(new User({ username: req.body.username }),
        req.body.password,
        function(err, user) {
            if (err) {
                return res.status(500).json({ err: err });
            }
            // cross-check the user register is registered. 
            passport.authenticate('local')(req, res, function() {
                return res.status(200).json({ status: 'Registration Successful!' });
            });
        });
});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        // user is null
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        //  login is happenning. 
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }

            // token is given to the user
            var token = Verify.getToken(user);
            res.status(200).json({
                status: 'Login successful!',
                success: true,
                token: token
            });
        });
        // the authentication ends
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

module.exports = router;
