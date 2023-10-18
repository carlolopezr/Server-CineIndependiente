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
	getGenresWithMovies,
	getWatchHistory,
	getUserMovies,
	updateGenreToMovie,
	getUserList,
	addMovieToUserList,
	deleteMovieFromUserList,
	deleteUserList,
	deleteWatchHistory,
	deleteMovieFromWatchHistory,
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
router.get('/get-genres-movies', getGenresWithMovies);

router.put(
	'/update-movie',
	[
		body('user_id_date', 'Falta el user_id_date').not().isEmpty(),
		body('data', 'Falta la data en la solicitud').not().isEmpty(),
		validarCampos,
	],
	updateMovie
);

router.get('/get-movies-by-user/:userId', getUserMovies);
router.get('/get-user-list/:userId', getUserList);
router.post('/add-movie-user-list', addMovieToUserList);
router.delete('/delete-movie-user-list', deleteMovieFromUserList);
router.delete('/delete-user-list/:userId', deleteUserList);
router.delete('/delete-user-watchhistory/:userId', deleteWatchHistory);
router.delete('/delete-movie-watchhistory', deleteMovieFromWatchHistory);

router.post('/save-watch-history', [], postWatchHistory);
router.get('/get-watch-history/:id', [], getWatchHistory);

router.put('/update-first-movie', [], updateFakeMovie);

router.get('/post-genres', postGenres);

router.put('/update-genretomovie', updateGenreToMovie);

module.exports = router;
