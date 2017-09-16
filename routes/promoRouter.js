console.log("promoRouter starting");

// const a = require('./server.js')

var express = require('express');
var bodyParser = require('body-parser');
// var server = require('./app.js');
var Promotions = require('../models/promotions');
var Verify = require('./verify');

var app = express();

var promoRouter = express.Router();

promoRouter.use(bodyParser.json());
// 
promoRouter.route('/')
    // this router to be applied to all below; this is a chain for the function .all
    .get(Verify.verifyOrdinaryUser, function(req, res, next) {
        Promotions.find({},
            function(err, promotion) {
                if (err) throw err
                res.json(promotion)
            })
    })

.post(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Promotions.create(req.body, function(err, promotion) {
        if (err) throw err;

        console.log('New Promotion added');
        var id = promotion.id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        })
        res.end('added the new promotion with id: ' + id);
    })
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Promotions.remove({},
        function(err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    res.end('deleting all promotions');
});

promoRouter.route('/:promotionId')
    // this say
    .get(Verify.verifyOrdinaryUser, function(req, res, next) {
        Promotions.findById(req.params.promotionId, function(err, promotionId) {
            if (err) throw err;
            res.json(promotion);
        })
    })

.put(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Promotions.findById(req.params.promotionId, {
        $set: req.body
    }, {
        new: true
    }, function(err, promotionId) {
        if (err) throw err;
        res.json(promotion);
    })
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    Promotions.findById(req.params.promotionId, function(err, resp) {
        if (err) throw err;
        res.json(resp);
    })
});

module.exports = promoRouter;
