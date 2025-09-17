const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.memoryStorage();

const upload = multer({ storage }).single('image');

const processImage = (req, res, next) => {
  if (!req.file) return next();

  const extension = MIME_TYPES[req.file.mimetype];
  const fileName = req.file.originalname.split(' ').join('_') + Date.now() + '.' + extension;
  const filePath = path.join('images', fileName);

  sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(filePath, (err) => {
      if (err) return next(err);

      req.file.filename = fileName;
      next();
    });
};

module.exports = { upload, processImage };