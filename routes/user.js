const { Router } = require('express');
const { getUser, postUser, getUsers, requestEmailVerification} = require('../controllers/user');

const router = Router();

router.get('/', getUser)

router.post('/', postUser)

router.get('/users', getUsers)
router.post('/emailVerification', requestEmailVerification)


module.exports = router;