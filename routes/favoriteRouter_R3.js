	var express     = require('express');
	var bodyParser  = require('body-parser');
	var mongoose = require('mongoose');
	var Favorites = require('../models/favorites');
	var Verify = require('./verify');
	var favoriteRouter = express.Router();

	favoriteRouter.use(bodyParser.json());
	favoriteRouter.route('/')

	.all(Verify.verifyOrdinaryUser)
	.get(function(req,res,next){
		var userId = req.decoded._doc._id
	    Favorites.find({ postedBy: userId })
	       .populate('postedBy')
	       .populate('dishes')
	       .exec(function (err, favorites) {
        	if (err) return next(err);
        	res.json(favorites);
     	    });
	  })

	.post(function(req, res, next){
		var userId = req.decoded._doc._id
		var dishId = req.body._id
	    //     Find the favorites
	    Favorites.findOne({ postedBy: userId }, function(err, favorite) {	    
	      
		      if (err) return next(err);      	    	      
		      if (favorite) {
			        if (favorite.dishes.indexOf(dishId) == -1) {
                    	favorite.dishes.push(dishId);
                	}

			   favorite.save(function (err, favorite) {
			            if (err) return next(err);
			            console.log('Updated favorites!');
			            res.json(favorite);
			        });	       
		        } else{ 
 //If it does not exist then the first favorite dish is created
			    favorite = new Favorites({
				          postedBy: userId,
				          dishes  :[ dishId]
				        });
		       
				        favorite.save(function(err,favorite) {
				      	if (err) throw err;
				        else {
				            	console.log("saving favorites...");
				            	res.json(favorite)
				             }
				        });
		      		}
	    	});						
		})

	.delete(function(req, res, next){
		var userId = req.decoded._doc._id
		Favorites.remove({ postedBy: userId }, function (err, favorites) {
			if (err) return next(err);
			 res.json(favorites)
		});
	});

	favoriteRouter.route('/:id')

	.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
		var dishId = req.params.id
	    var userId = req.decoded._doc._id
        Favorites.findOneAndUpdate({'postedBy': userId}, 
        	                       {$pull: {dishes: dishId}}, 
        	                       function (err, favorite) {
           if (err){            
            	var err = new Error('dishId no exist or contact a administrator!');            	
            	return next(err);              
           }
            Favorites.findOne({'postedBy': req.decoded._doc._id}, function(err, favorite){
            	if (err) return next(err);
                res.json(favorite);
            });
        });
    });

	

	module.exports = favoriteRouter;