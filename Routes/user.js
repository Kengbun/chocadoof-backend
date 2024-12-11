const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');


router.post('/register', userController.createUser);
router.get('/', userController.listUsers);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/login', userController.loginUser);
// router.post('/logout', userController.logoutUser);
router.delete('/:id', userController.deleteUser);  


module.exports = router;
