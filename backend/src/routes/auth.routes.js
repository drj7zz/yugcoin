const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);
router.get('/me', authMiddleware, authController.getProfile);
router.put('/password', authMiddleware, authController.changePassword);
router.put('/security-pin', authMiddleware, authController.changeSecurityPin);

module.exports = router;
