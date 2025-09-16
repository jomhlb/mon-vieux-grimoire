const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Inscription
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hachage du mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const user = new User({
      email: email,
      password: hash
    });

    await user.save();

    res.status(201).json({ message: 'Utilisateur créé !' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Recherche de l'utilisateur dans la base
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé !' });
    }

    // Comparaison du mot de passe
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect !' });
    }

    // Génération du token JWT
    const token = jwt.sign(
      { userId: user._id },
      'RANDOM_SECRET_KEY',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      userId: user._id,
      token: token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
