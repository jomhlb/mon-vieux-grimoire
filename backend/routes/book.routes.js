const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String },
    year: { type: Number },
    genre: { type: String }
});

module.exports = mongoose.model('Book', bookSchema);