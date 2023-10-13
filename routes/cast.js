const { Router } = require('express');
const { body, check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { updateCast } = require('../controllers/cast');



const router = Router();


router.put('/update-cast', [
    check('cast', 'Falta el cast en la solicitud').not().isEmpty(),
    validarCampos
], updateCast)


module.exports = router