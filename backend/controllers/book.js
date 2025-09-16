const Book = require('../models/Book');

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Créer un livre
exports.createBook = (req, res, next) => {
  const book = new Book({
    ...req.body,
    userId: req.body.userId
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre créé !' }))
    .catch(error => res.status(400).json({ error }));
};