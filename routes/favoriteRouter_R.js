var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Favorite = require('../models/favorites');
var Verify = require('./verify');


router.use(bodyParser.json());

router.route('/')
    .all(Verify.verifyOrdinaryUser)

.get(function(req, res, next) {
    Favorite.findOne({
            postedBy: req.decoded._id
        })
        .populate('postBy dishes')
        .exec(function(err, favorite) {
            if (err) {
                return next(err);
            }
            res.json(favorite);
        });
})

.post(function(req, res, next) {
    Favorite.findOneAndUpdate({
        postedBy: req.decoded._id
    }, {
        $addToSet: {
            dishes: req.body
        }
    }, {
        upsert: true,
        new: true
    }, function(err, favorite) {
        if (err) return next(err);
        console.log('favorite updated');
        res.json(favorite);
    });
})

.delete(function(req, res, next) {
    Favorite.findOneAndRemove({
        postedBy: req.decoded._id
    }, function(err, resp) {
        if (err) return next(err);
        res.json(resp);
    });
});

router.route('/:dishObjectId')
    .all(Verify.verifyOrdinaryUser)

// .post(function(req, res, next) {

// })

.delete(function(req, res, next) {
    Favorite.findOneAndUpdate({
        postedBy: req.decoded._id
    }, {
        $pull: {
            dishes: req.params.dishObjectId
        }
    }, {
        new: true
    }, function(err, favorite) {
        if (err) return next(err);
        console.log('Deleted dish: ' + req.param.dishObjectId);
        res.json(favorite);
    });
});

module.exports = router;
