const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

const { authenticateToken } = require('../middleware/auth');
const { userUpload } = require('../middleware/upload');



router.post('/register', userController.createUser);
router.get('/', authenticateToken ,userController.listUsers);

router.get('/me', authenticateToken ,userController.profile);
router.put('/me', authenticateToken, userUpload.single('profile_picture') ,userController.updateUser);


router.get('/verify-email/:token', userController.verifyEmail);
router.post('/login', userController.loginUser);
// router.post('/logout', userController.logoutUser);
router.delete('/:id', authenticateToken, userController.deleteUser);  


module.exports = router;
