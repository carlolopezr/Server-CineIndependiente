const { Router } = require('express');
const { body, check } = require('express-validator');
const {
	postGenre,
	getAllGenres,
	postMovie,
	getAllMovies,
	updateMovie,
	updateFakeMovie,
	postGenres,
	getMovie,
	postWatchHistory,
	deleteMovie,
	getMoviesByGenre,
} = require('../controllers/movie');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

router.post(
	'/',
	[body('genres', 'Por favor ingrese al menos 1 género').not().isEmpty(), validarCampos],
	postMovie
);

router.get('/movie/:id', getMovie);
router.delete(
	'/movie/:id',
	[check('id', 'Falta el id en la solicitud').not().isEmpty(), validarCampos],
	deleteMovie
);

router.get('/get-movies', getAllMovies);
router.get('/get-movies-by-genre/:id', getMoviesByGenre);

router.post(
	'/post-genre',
	[body('genre', 'Por favor ingrese un género').not().isEmpty()],
	validarCampos,
	postGenre
);

router.get('/get-genres', getAllGenres);

router.put(
	'/update-movie',
	[
		body('date', 'Falta la fecha en la solicitud').not().isEmpty(),
		body('user_id', 'Falta el user_id').not().isEmpty(),
		body('data', 'Falta la data en la solicitud').not().isEmpty(),
		validarCampos,
	],
	updateMovie
);

router.post('/save-watch-history', [], postWatchHistory);

router.put('/update-first-movie', [], updateFakeMovie);

router.get('/post-genres', postGenres);

module.exports = router;
