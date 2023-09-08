const { Router } = require('express');
const { getUser, postUser, getUsers} = require('../controllers/user');

const router = Router();

router.get('/', getUser)

router.post('/', postUser)

router.get('/users', getUsers)


module.exports = router;