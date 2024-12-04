const mongoose = require('mongoose');

const stuffSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        default: Date.now,
        required: true,
    }
});

const Stuff = mongoose.model('Stuff', stuffSchema);

module.exports = Stuff;