const { Router } = require('express');
const { getUser, postUser, getUsers, 
    requestEmailVerification, checkVerificationCode, revalidateToken, loginUser} = require('../controllers/user');
const { validateJWT } = require('../middlewares/validateJWT');
const { body } = require('express-validator')

const router = Router();

router.get('/', [ ] , getUser)
router.post('/', postUser)
router.post('/login', loginUser)
router.get('/users', getUsers)
router.get('/refresh', validateJWT, revalidateToken)
router.post('/emailVerification', requestEmailVerification)
router.post('/checkVerificationCode', checkVerificationCode)


module.exports = router;