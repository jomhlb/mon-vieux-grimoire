const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'mY$up3r$3cr3tK3y!2025#JWT+tokenSafe');
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json(error);
  }
};