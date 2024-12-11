const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review');

router.post('/', reviewController.createReview);
router.get('/', reviewController.listReviews);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;