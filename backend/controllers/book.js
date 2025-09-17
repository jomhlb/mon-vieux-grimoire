const Book = require('../models/Book');
const fs = require('fs');

// Créer un livre
exports.createBook = (req, res, next) => {
  let bookObject = {};

  if (req.body.book) {
    bookObject = JSON.parse(req.body.book);
  } else {
    bookObject = req.body;
  }

  delete bookObject._id;
  delete bookObject.userId;

  let ratings = [];
  let averageRating = 0;

  if (bookObject.ratings && bookObject.ratings.length > 0) {
    ratings = bookObject.ratings.map(r => ({
      userId: r.userId || req.auth.userId,
      grade: Number(r.grade)
    }));

    const total = ratings.reduce((sum, r) => sum + r.grade, 0);
    averageRating = total / ratings.length;
  }

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.file
      ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
      : null,
    ratings: ratings,
    averageRating: averageRating
  });

  book.save()
    .then(() => res.status(201).json({ message: "Livre créé !" }))
    .catch(error => res.status(400).json({ error }));
};


// Modifier un livre
exports.updateBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
    : { ...req.body };

  delete bookObject.userId;

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié !' }))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(400).json({ error }));
};

// Supprimer un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: 'Unauthorized request' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
            .catch(error => res.status(400).json({ error }));
        });
      }
    })
    .catch(error => res.status(400).json({ error }));
};

// Récupérer un livre par ID
exports.getBookById = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

// Récupérer tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Récupérer les 3 livres les mieux notés
exports.getBestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

// Ajouter une note à un livre
exports.addRating = (req, res, next) => {
  const userId = req.auth.userId;      
  const rating = parseInt(req.body.rating, 10);

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ error: 'Livre non trouvé !' });

      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) return res.status(403).json({ error: 'Vous avez déjà noté ce livre' });

      book.ratings.push({ userId, grade: rating });
      
      book.averageRating = parseFloat(
        (book.ratings.reduce((acc, r) => acc + r.grade, 0) / book.ratings.length).toFixed(1)
      );

      book.save()
        .then(() => res.status(200).json(book))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(400).json({ error }));
};
