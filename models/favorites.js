var mongoose = require('mongoose');

var Schema = mongoose.Schema

var FavoritesSchema = new Schema({
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        unique: true
    }],
    addedBy:{
        // reference to the user object. controlling user permission to edit.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});

// we need to create a model using it
var Favorites = mongoose.model('Favorite', FavoritesSchema);

// make this available to our Node applications
module.exports = Favorites;
