const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

const processImage = (req, res, next) => {
  if (!req.file) return next();

  const extension = 'jpg'; 
  const fileName =
    req.file.originalname.split(' ').join('_') + Date.now() + '.' + extension;
  const filePath = path.join('images', fileName);

  const width = 300;
  const height = 400;
  const borderRadius = 20;

  // SVG pour arrondir les coins
  const svgMask = `
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${borderRadius}" ry="${borderRadius}" fill="white"/>
    </svg>
  `;

  sharp(req.file.buffer)
    .resize(width, height, { fit: 'cover' })
    .composite([{ input: Buffer.from(svgMask), blend: 'dest-in' }])
    .png({ quality: 80 })
    .toFile(filePath)
    .then(() => {
      req.file.filename = fileName;
      next();
    })
    .catch(err => next(err));
};




module.exports = { upload, processImage };