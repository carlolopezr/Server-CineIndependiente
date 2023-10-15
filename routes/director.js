const { Router } = require('express');
const { body, check } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');
const { updateDirector } = require('../controllers/director');


const router = Router();

router.get('/get-directors', (req, res) => {
    res.send('Hola mundo')
} )

router.put('/update-director', [
    check('directors', 'Faltan los directores en la solicitud').not().isEmpty(),
    check('movie_id', 'Falta el movie_id en la solicitud').not().isEmpty(),
    validarCampos
] ,updateDirector)

module.exports = router