const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { userUpload } = require('../middleware/upload');


router.post('/forgot-password', userController.forgotPassword);
router.post('/forgot-password/:token', userController.resetPassword);

router.post('/register', userController.createUser);
router.get('/', authenticateToken, authorizeRole(["admin"]), userController.listUsers);

router.get('/dashboard', authenticateToken, authorizeRole(["admin"]), userController.dashboard);

router.get('/me', authenticateToken ,userController.profile);
router.put('/me', authenticateToken, userUpload.single('profile_picture') ,userController.updateUser);


router.get('/verify-email/:token', userController.verifyEmail);
router.post('/login', userController.loginUser);
// router.post('/logout', userController.logoutUser);
router.delete('/:id', authenticateToken, authorizeRole(["admin"]), userController.deleteUser);  


module.exports = router;
