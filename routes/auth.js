const { body } = require('express-validator')
const { Router } = require('express');
const { loginUser } = require('../controllers/auth');

const router = Router();

router.post('/login', loginUser)


module.exports = router