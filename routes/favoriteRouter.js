console.log("FavoriteRouter starting");

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
//adding schema model
var Favorites = require('../models/favorites');
var Dishes = require('../models/dishes');
// adding router. as it is the same folder as the router
var Verify = require('./verify');

var app = express();

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    // this router to be applied to all below; this is a chain for the function .all
    .get(Verify.verifyOrdinaryUser, function(req, res, next) {
        Favorites.find({ 'addedBy': req.decoded._doc._id })
            .populate('addedBy')
            .populate('dishes')
            // Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). One to one, one to many or all Like relationship in a normal database
            .exec(function(err, favorite) {
                // .exec is similar to a callback function. RE: http://mongoosejs.com/docs/promises.html
                if (err) throw err;
                res.json(favorite);
            })
    })

.post(Verify.verifyOrdinaryUser, function(req, res, next) {


    Favorites.findOne({ 'addedBy': req.decoded._doc._id }, function(err, favorite) {
        console.log(favorite)
        if (favorite == null) {

            Favorites.create(req.body, function(err, favorite) {
                // if (favorite.dishes == undefined) {
                console.log(favorite)
                console.log("there already and initial creation")
                if (err) throw err;

                console.log('favorite created!');
                favorite.addedBy = req.decoded._doc._id;
                favorite.dishes.push(req.body);
                favorite.save(function(err, favorite) {
                    if (err) throw err;
                    console.log('Updated Favorites!');
                    res.json(favorite);
                }); //for the create
            });
            // } else {
            //     console.log(favorite)


            //     if (err) throw err;

            //     favorite.dishes.push(req.body);
            //     favorite.save(function(err, favorite) {
            //         if (err) throw err;
            //         console.log('Added new Favorite');
            //         res.json(favorite);
            //     });
            // }
        } else {
            for (var i = 0; i < favorite.dishes.length; i++) {
                if (!(favorite.dishes[i] == req.body._id)) {
                    favorite.dishes.push(req.body._id);
                }
            }
            favorite.save(function(err, favorite) {
                if (err) throw err;
                res.json(favorite);
            });

        }
    })
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Favorites.remove({}, function(err, resp) {
        if (err) throw err;
        // if (err) res.send(err);
        // res.json(resp);
        // res.json and res.end is the same thing which make the server to send the same thing twice, causing an error. 
    })
    res.end('Deleting all favorite')
    console.log('deleted all favorite')
});

favoriteRouter.route('/:dishId')
    // this says
    // .get(Verify.verifyOrdinaryUser, function(req, res, next) {
    //     Favorites.findById(req.params.favoriteId, function(err, favorite) {
    //         if (err) throw err;
    //         res.json(favorite);
    //     })
    // })

// .put(Verify.verifyOrdinaryUser, function(req, res, next) {
//     Favorites.findById(req.params.favoriteId, {
//         $set: req.body
//     }, {
//         new: true
//     }, function(err, favorite) {
//         if (err) throw err;
//         res.json(favorite);
//     })
// })

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Favorites.findById(req.params.dishId, function(err, favorite) {
        console.log(req.params.favoriteId)
        console.log(req.params.dishId)
        console.log(req.decoded._doc._id)
        console.log(favorite.dishes)
            // console.log(favorite.)
        if (favorite.addedBy != req.decoded._doc._id) {

            var err = new Error('You are not authorized to perform this operation!');
            err.status = 401;
            next(err);
        }
        console.log("deleting")
        favorite.dishes.remove(req.params.dishId);
        console.log("deleted")
        favorite.save(function(err, resp) {

            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = favoriteRouter;
