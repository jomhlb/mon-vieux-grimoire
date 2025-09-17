const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const { upload, processImage } = require('../middleware/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/bestrating', bookCtrl.getBestRatingBooks);
router.get('/:id', bookCtrl.getBookById);
router.get('/', bookCtrl.getAllBooks);

router.post('/', auth, upload, processImage, bookCtrl.createBook);
router.put('/:id', auth, upload, processImage, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.addRating);

module.exports = router;
