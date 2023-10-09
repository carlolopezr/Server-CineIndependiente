const { request, response } = require('express');
const { prisma } = require('../database/config');
const { recoverFromNotFound } = require('../helpers/recoverFromNotFound');

const postMovie = async (req = request, res = response) => {
	const { movie, directors, writers, cast, genres } = req.body;

	const genresWithId = genres.map(genre => ({
		genre_id: genre,
	}));

	try {
		const createdMovie = await prisma.movie.create({
			data: {
				...movie,
				cast: {
					createMany: {
						data: cast,
					},
				},
				writers: {
					createMany: {
						data: writers,
					},
				},
				directors: {
					createMany: {
						data: directors,
					},
				},
				genres: {
					connect: genresWithId,
				},
			},
		});
		res.status(201).json({ createdMovie });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			msg: 'Ocurrio un error al guardar la información de la película',
		});
	}
};

const updateMovie = async (req = request, res = response) => {
	try {
		const { date, user_id, data } = req.body;
		const updateMovie = await prisma.movie
			.updateMany({
				where: {
					date: date,
					user_id: user_id,
				},
				data: data,
			})
			.catch(err => {
				res.status(400).json({
					msg: `Hubo un error al intentar encontrar la película en la base de datos: ${err}`,
				});
			});

		res.status(200).json({
			msg: 'Película actualizada correctamente',
			updateMovie,
		});
	} catch (error) {
		res.status(500).json({
			msg: `Hubo un error al intentar actualizar la película: ${error}`,
		});
	}
};

const deleteMovie = async (req = request, res = response) => {
	const id = req.params.id;

	try {
		await prisma.movie.update({
			where: {
				movie_id: id,
			},
			data: {
				directors: {
					deleteMany: {},
				},
				cast: {
					deleteMany: {},
				},
				writers: {
					deleteMany: {},
				},
				genres: {
					set: [],
				},
			},
		});

		const deletedMovie = await prisma.movie.delete({
			where: {
				movie_id: id,
			},
		});

		res.status(200).json({
			msg: 'Película eliminada correctamente',
			deletedMovie,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'No se pudo eliminar la película',
			error,
		});
	}
};

const updateFakeMovie = async (req = request, res = response) => {
	try {
		const { movie, directors, writers, cast, genres } = req.body;

		delete movie.user_id;

		console.log(movie.user_id_date);
		const genresWithId = genres.map(genre => ({
			genre_id: genre,
		}));

		const updatedFakeMovie = await prisma.movie.update({
			where: {
				user_id_date: movie.user_id_date,
			},
			data: {
				directors: {
					deleteMany: {},
				},
				cast: {
					deleteMany: {},
				},
				writers: {
					deleteMany: {},
				},
				genres: {
					set: [],
				},
			},
		});

		if (!updatedFakeMovie) {
			return res.status(404).json({
				msg: 'Error al intentar guardar la película',
			});
		}

		const updatedMovie = await prisma.movie.update({
			where: {
				user_id_date: movie.user_id_date,
			},
			data: {
				...movie,
				cast: {
					createMany: {
						data: cast,
					},
				},
				writers: {
					createMany: {
						data: writers,
					},
				},
				directors: {
					createMany: {
						data: directors,
					},
				},
				genres: {
					connect: genresWithId,
				},
			},
		});

		if (!updatedMovie) {
			return res.status(404).json({
				msg: 'Hubo un error al intentar encontrar la película en la base de datos',
			});
		}

		res.status(200).json({
			msg: 'Película guardada correctamente',
			updateMovie: updatedMovie,
		});
	} catch (error) {
		res.status(500).json({
			msg: `Hubo un error al intentar guardar la película`,
		});
	}
};

const getMovie = async (req = request, res = response) => {
	const id = req.params.id;

	if (!id) {
		return res.status(400).json({
			msg: 'No hay id de la película',
		});
	}

	try {
		const movie = await prisma.movie.findUnique({
			where: {
				movie_id: id,
			},
			include: {
				cast: true,
				directors: true,
				genres: true,
				writers: true,
			},
		});

		if (!movie) {
			return res.status(404).json({
				msg: 'Película no encontrada',
			});
		}

		res.status(200).json({
			movie,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Hubo un error al encontrar la película',
		});
	}
};

const getAllMovies = async (req = request, res = response) => {
	const q = req.query.q || '';
	try {
		const movies = await prisma.movie.findMany({
			where: {
				enabled: true,
				explicitContent: false,
				movieUrl: {
					not: null,
				},
				productionYear: {
					not: 0,
				},
				OR: [
					{
						title: {
							contains: q,
						},
					},
					{
						cast: {
							some: {
								name: {
									contains: q,
								},
							},
						},
					},
					{
						genres: {
							some: {
								name: {
									contains: q,
								},
							},
						},
					},
				],
			},
		});

		if (!movies || movies.length === 0) {
			return res.status(404).json({
				msg: 'No se encontraron películas',
			});
		}
		res.status(200).json(movies);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			msg: 'Hubo un error al obtener las películas',
		});
	}
};

const getMoviesByGenre = async (req = request, res = response) => {
	const id = req.params.id || '';
	try {
		const movies = await prisma.movie.findMany({
			where: {
				genres: {
					some: {
						genre_id: id,
					},
				},
			},
		});
		if (!movies || movies.length === 0) {
			return res.status(404).json({
				msg: 'No se encontraron películas',
			});
		}
		res.status(200).json(movies);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			msg: 'Hubo un error al obtener las películas',
		});
	}
};

const postGenre = async (req = request, res = response) => {
	const { genre } = req.body;

	const genreData = {
		name: genre,
	};

	try {
		const createdGenre = await prisma.genre.create({
			data: genreData,
		});
		res.status(201).json({
			createdGenre,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Hubo un error al guardar el género',
		});
	}
};

//!Semilla
const postGenres = async (req = request, res = response) => {
	try {
		const createdGenres = await prisma.genre.createMany({
			data: [
				{
					name: 'Fantasía y Ciencia ficción',
				},
				{
					name: 'Romance',
				},
				{
					name: 'Cortos',
				},
				{
					name: 'Anime',
				},
				{
					name: 'Documentales',
				},
				{
					name: 'Terror y Suspenso',
				},
				{
					name: 'Comedia',
				},
				{
					name: 'Crimen',
				},
				{
					name: 'Acción',
				},
				{
					name: 'Deportes',
				},
				{
					name: 'Animación',
				},
			],
		});
		res.status(201).json({
			createdGenres,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Hubo un error al guardar los géneros',
		});
	}
};

const getAllGenres = async (req = request, res = response) => {
	try {
		const genres = await prisma.genre.findMany();
		if (!genres || genres.length === 0) {
			return res.status(404).json({
				msg: 'No se encontraron géneros',
			});
		}
		res.status(200).json(genres);
	} catch (error) {
		res.status(500).json({
			msg: 'Hubo un error al obtener los géneros',
		});
	}
};

const postWatchHistory = async (req = request, res = response) => {
	try {
		const { currentTime, user_id, movie_id } = req.body;
		const newCurrentTime = Number(currentTime);

		const updatedWatchHistory = await prisma.watchHistory.upsert({
			where: {
				user_id_movie_id: {
					user_id: user_id,
					movie_id: movie_id,
				},
			},
			update: {
				viewingTime: newCurrentTime,
			},
			create: {
				user: { connect: { user_id: user_id } },
				movie: { connect: { movie_id: movie_id } },
				viewingTime: newCurrentTime,
			},
		});

		res.status(200).json({
			msg: 'Historial guardado con éxito',
			updatedWatchHistory,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			msg: 'Ha ocurrido un error',
			error: error,
		});
	}
};

module.exports = {
	postMovie,
	postGenre,
	getAllGenres,
	getAllMovies,
	updateMovie,
	getMovie,
	updateFakeMovie,
	postGenres,
	postWatchHistory,
	deleteMovie,
	getMoviesByGenre,
};
