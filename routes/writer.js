const { Router } = require('express');
const { body, check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { updateWriter } = require('../controllers/writer');

const router = Router();


router.put('/update-writer', [
    check('writers', 'Faltan los writers en la solicitud').not().isEmpty(),
    check('movie_id', 'Falta el movie_id en la solicitud').not().isEmpty(),
    validarCampos
], updateWriter)


module.exports = router