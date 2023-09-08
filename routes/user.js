const { Router } = require('express');
const { getUser, postUser, getUsers, requestEmailVerification, checkVerificationCode} = require('../controllers/user');

const router = Router();

router.get('/', getUser)
router.post('/', postUser)
router.get('/users', getUsers)
router.post('/emailVerification', requestEmailVerification)
router.post('/checkVerificationCode', checkVerificationCode)


module.exports = router;