const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post('/signup', ctrl.signup);
router.post('/login', ctrl.login);
router.post('/logout', auth(true), ctrl.logout);
router.get('/profile', auth(true), ctrl.profile);

module.exports = router;
