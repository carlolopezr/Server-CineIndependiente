const { Router } = require('express');
const { body } = require('express-validator');
const { postGenre, getAllGenres, postMovie } = require('../controllers/movie');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

router.post('/', postMovie);

router.post(
	'/post-genre',
	[body('genre', 'Por favor ingrese un género').not().isEmpty()],
	validarCampos,
	postGenre
);

router.get('/get-genres', getAllGenres);

module.exports = router;
