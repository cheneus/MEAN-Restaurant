console.log("DishRouter starting");

// const a = require('./server.js')

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
// var server = require('./app.js');

//adding schema model
var Dishes = require('../models/dishes');
// adding router. as it is the same folder as the router
var Verify = require('./verify');

var app = express();

var dishRouter = express.Router();

dishRouter.use(bodyParser.json());

// the verification is done first before a get/post/delete is done. 
// this is done as you can see that the code is chained. 
dishRouter.route('/')
    // this router to be applied to all below; this is a chain for the function .all
    .get(Verify.verifyOrdinaryUser, function(req, res, next) {
        // first parameter, what i am going search
        // second parameter, callback function that if there is an error, it will display this error
        // takes the res.json ; when a json.res is suppled wth a js object is will be converted into a json string. 
        Dishes.find({})
        .populate('comment.postedBy')
            // Population is the process of automatically replacing the specified paths in the document with document(s) from other collection(s). One to one, one to many or all Like relationship in a normal database
            .exec(function(err, dish) {
                // .exec is similar to a callback function. RE: http://mongoosejs.com/docs/promises.html
                if (err) throw err;
                res.json(dish);
            });
    })

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    // 
    Dishes.create(req.body, function(err, dish) {
        if (err) throw err;

        console.log('Dish created!');
        var id = dish._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Added the dish with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {

    Dishes.remove({},
        function(err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    res.end('Deleting all dishes');
});

// code for handling the Dish ID
dishRouter.route('/:dishId')

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function(err, dish) {
            if (err) throw err;
            res.json(dish);
        })
})

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Dishes.findbyId(req.params.dishId, {
        // the body of the incoming message, contains the update in JSON
        $set: req.body

    }, {
        new: true
    }, function(err, dish) {
        if (err) throw err;
        res.json(dish);
    })
})

// code use to delete, findByIdAndRemove()
.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Dishes.findByIdAndRemove(req.params.dishId, function(err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

// handles code 
dishRouter.route('/:dishId/comments')
    .get(function(req, res, next) {
        Dishes.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function(err, dish) {
                if (err) throw err;
                res.json(dish.comments);
            });
    })

.post(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.params.dishId, function(err, dish) {
        if (err) throw err;
        // postedBy is also inserted into the comment.
        req.body.postedBy = req.decoded._doc._id;

        dish.comments.push(req.body);

        dish.save(function(err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.params.dishId, function(err, dish) {
        if (err) throw err;
        // for loop is done to find the loop and then delete
        for (var i = (dish.comments.length - 1); i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
        }
        dish.save(function(err, result) {
            if (err) throw err;
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Deleted all comments!');
        });
    });
});

// handles the comments id
dishRouter.route('/:dishId/comments/:commentId')

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.params.dishId)
        .populate('comments.postedBy')
        .exec(function(err, dish) {
            if (err) throw err;
            res.json(dish.comments.id(req.params.commentId));
        });
})

.put(Verify.verifyOrdinaryUser, function(req, res, next) {
    // We delete the existing commment and insert the updated
    // comment as a new comment
    Dishes.findById(req.params.dishId, function(err, dish) {
        if (err) throw err;

        // first comment is deleted
        dish.comments.id(req.params.commentId).remove();
        // re-insert the user info.
        req.body.postedBy = req.decoded._doc._id;

        dish.comments.push(req.body);
        dish.save(function(err, dish) {
            if (err) throw err;
            console.log('Updated Comments!');
            res.json(dish);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Dishes.findById(req.params.dishId, function(err, dish) {

        if (dish.comment.id(req.params.commentId).postedBy != req.decoded._doc._id) {

            var err = new Error('You are not authorized to perform this operatio!');
            err.status = 401;
            next(err);
        }

        dish.comments.id(req.params.commentId).remove();

        dish.save(function(err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = dishRouter;
