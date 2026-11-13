const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate.middleware');

// POST /api/auth/register — Create a new user account
router.post('/register', validateBody(['name', 'email', 'password']), register);

// POST /api/auth/login — Authenticate and receive JWT
router.post('/login', validateBody(['email', 'password']), login);

module.exports = router;
