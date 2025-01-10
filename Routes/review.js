const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.post('/', authenticateToken, reviewController.createReview);
router.get('/', reviewController.listReviews);
router.delete('/:id', authenticateToken, authorizeRole(["admin"]), reviewController.deleteReview);

module.exports = router;