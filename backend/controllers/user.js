const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Inscription
exports.signup = (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, 10)
    .then(hash => {
      const user = new User({
        email: email,
        password: hash
      });

      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Connexion
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé !' });

      bcrypt.compare(password, user.password)
        .then(valid => {
          if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect !' });

          const token = jwt.sign(
            { userId: user._id },
            'RANDOM_SECRET_KEY',
            { expiresIn: '24h' }
          );

          res.status(200).json({
            userId: user._id,
            token: token
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
