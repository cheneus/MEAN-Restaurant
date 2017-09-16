var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var Favorites = require('../models/favorites');
var Dishes = require('../models/dish');


var FavoriteRouter = express.Router();
FavoriteRouter.use(bodyParser.json());

FavoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser,function(req,res,next){
        Favorites.find({'postedBy': req.decoded._doc._id})
		.populate('postedBy')
		.populate('dishes')
		.exec(function(err,favorite) {
			if(err) throw err;
			res.json(favorite);
		});
})

.post(Verify.verifyOrdinaryUser,Verify.verifyAdmin, function(req, res, next){
	Favorites.find({'postedBy': req.decoded._doc._id})
	.exec(function(err,favorite) {
		if(err) throw err;
		if(favorite.length==0) {
		Favorites.create(req.body, function(err,favorite) {
	    if(err) throw err;
		console.log('favorite Created!');
		favorite.postedBy = req.decoded._doc._id;
		favorite.dishes.push(req.body._id);
		favorite.save( function(err,favorite) {
			if(err) throw err;
			res.json(favorite);
		});
	});
	}
	else {
		for(var i = 0; i < favorite.dishes.length; i++)
		{
			if(!(favorite.dishes[i] == req.body._id))
			{
				favorite.dishes.push(req.body._id);
		    }
		}
		    favorite.save( function(err,favorite) {
			if(err) throw err;
			res.json(favorite);
		}
	}

});

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
    Favorites.remove({'postedBy': req.decoded._doc._id}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});



dishRouter.route('/:dishId')
.all(Verify.verifyOrdinaryUser)
.delete(Verify.verifyAdmin, function (req, res, next) {
	Favorites.find({'postedBy': req.decoded._doc._id})
	.exec(function(err,favorite) {
		if(err) throw err;
		for(var i = 0; i < favorite.dishes.length; i++)
		{
			if((favorite.dishes[i] == req.params.dishId))
				favorite.dishes.remove(req.params.dishId);
		}
		favorite.save( function(err,favorite) {
			if(err) throw err;
			res.json(favorite);
		}
	}
});
module.exports = dishRouter;