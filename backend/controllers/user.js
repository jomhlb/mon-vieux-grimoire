const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Inscription
exports.signup = (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, 10)
    .then(hash => {
      const user = new User({ email, password: hash });
      return user.save();
    })
    .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
    .catch(error => {
      if (error.code === 11000) {
        return res.status(400).json(new Error('Adresse email déjà utilisée'));
      }
      res.status(400).json(error);
    });
};

// Connexion
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) return res.status(401).json(new Error('Utilisateur non trouvé !'));

      return bcrypt.compare(password, user.password)
        .then(valid => {
          if (!valid) return res.status(401).json(new Error('Mot de passe incorrect !'));

          const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
          res.status(200).json({ userId: user._id, token });
        });
    })
    .catch(error => res.status(500).json(error));
};
