console.log("leaderRouter starting");

// const a = require('./server.js')

var express = require('express');
var bodyParser = require('body-parser');
// var server = require('./app.js');
var Leaderships = require('../models/leaderships')

var app = express();

var leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());
// 
leaderRouter.route('/')
    // this router to be applied to all below; this is a chain for the function .all
    .get(function(req, res, next) {
        Leaderships.find({},
            function(err, leadership) {
                if (err) throw err;
                res.json(leadership);
            })
    })

.post(function(req, res, next) {
    Leaderships.create(req.body, function(err, leadership) {
        if (err) throw err;

        console.log('New Leader created');
        var id = leadership.id;
        res.writeHead(200, {
            'Context-Type': 'text/plain'
        })
        res.end('Added the leader with id: ' + id);
    })
})

.delete(function(req, res, next) {
    Leaderships.remove({}, function(err, resp) {
        if (err) throw err;
        // if (err) res.send(err);
                // res.json(resp);
// res.json and res.end is the same thing which make the server to send the same thing twice, causing an error. 
    })
    res.end('Deleting all leader')
    console.log('deleted all leaders')
});

leaderRouter.route('/:leadershipId')
    // this says
    .get(function(req, res, next) {
        Leaderships.findById(req.params.leadershipId, function(err, leadership) {
            if (err) throw err;
            res.json(leadership);
        })
    })

.put(function(req, res, next) {
    Leaderships.findById(req.params.leadershipId, {
        $set: req.body
    }, {
        new: true
    }, function(err, leadeship) {
        if (err) throw err;
        res.json(leadership);
    })
})

.delete(function(req, res, next) {
    Leaderships.findById(req.params.leadershipId, function(err, resp) {
        if (err) throw err;
        res.json(resp);
    })
});

module.exports = leaderRouter;
