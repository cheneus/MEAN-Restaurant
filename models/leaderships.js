var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Currency = mongoose.Types.Currency;

var LeadershipsSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    abbr: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

var Leaderships = mongoose.model('Leaderships', LeadershipsSchema);

module.exports = Leaderships;
