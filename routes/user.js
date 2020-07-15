const express = require('express');

const router = express.Router();
const userCtrl = require('../controllers/user');
const noCache = require('../middleware/noCache');
const verifyPassword = require('../middleware/verifyPassword');
const rateLimiter = require('../middleware/rateLimiter');

router.post('/signup', noCache, verifyPassword, userCtrl.signup)
router.post('/login', noCache, rateLimiter, userCtrl.login)

module.exports = router;