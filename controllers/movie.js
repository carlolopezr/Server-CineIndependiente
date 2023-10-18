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
		const { user_id_date, data } = req.body;
		const updateMovie = await prisma.movie
			.update({
				where: {
					user_id_date: user_id_date,
				},
				data: data,
			})
			.catch(err => {
				throw new Error('Hubo un error al intentar encontrar la película');
			});

		res.status(200).json({
			msg: 'Película actualizada correctamente',
			updateMovie,
		});
	} catch (error) {
		res.status(error.status || 500).json({
			msg: 'Hubo un error al intentar actualizar la película',
			error: error.message,
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
				user: {
					active: true,
				},
				movieUrl: {
					not: null,
				},
				explicitContent: false,
				productionYear: {
					not: 0,
				},
			},
			include: {
				cast: {
					orderBy: {
						name: 'asc',
					},
				},
				directors: {
					orderBy: {
						name: 'asc',
					},
				},
				genres: true,
				writers: {
					orderBy: {
						name: 'asc',
					},
				},
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
				user: {
					active: true,
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
				productionYear: {
					not: 0,
				},
				explicitContent: false,
				enabled: true,
				user: {
					active: true,
				},
				movieUrl: {
					not: null,
				},
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

const getGenresWithMovies = async (req = request, res = response) => {
	try {
		const genres = await prisma.genre.findMany({
			include: {
				movies: {
					where: {
						productionYear: {
							not: 0,
						},
						enabled: true,
						explicitContent: false,
						user: {
							active: true,
						},
						movieUrl: {
							not: null,
						},
					},
				},
			},
		});
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

const getWatchHistory = async (req = request, res = response) => {
	const id = req.params.id;
	if (!id) {
		return res.status(400).json({
			msg: 'No hay id en la solicitud',
		});
	}

	try {
		const watchHistory = await prisma.watchHistory.findMany({
			where: {
				user_id: id,
			},
			include: {
				movie: true,
			},
		});

		if (!watchHistory || watchHistory.length === 0) {
			return res.status(404).json({
				msg: 'No se ha encontrado el historial de visualización',
			});
		}

		res.status(200).json({
			watchHistory,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al obtener el historial de visualización',
			error,
		});
	}
};

const deleteWatchHistory = async(req = request, res = response) => {
	const user_id = req.params.userId;
	if(!user_id) {
		return res.status(400).json({
			msg:"No hay id del usuario en la solicitud."
		})
	}
	try {
		
		const deletedWatchHistoryCount = await prisma.watchHistory.deleteMany({
			where:{
				user_id
			}
		})

		res.status(200).json({
			msg:"Historial de visualización eliminado correctamente.",
			deletedWatchHistoryCount
		})
	} catch (error) {
		res.status(500).json({
			msg:"Ha ocurrido un error al eliminar el historial de visualización."
		})
	}
}

const deleteMovieFromWatchHistory = async(req = request, res = response) => {
	const { movie_id, user_id } = req.body;

	if(!movie_id || !user_id){
		return res.status(400).json({
			msg:"Falta el id en la solicitud"
		})
	}

	try {
		const deletedWatchHistory = await prisma.watchHistory.delete({
			where:{
				user_id_movie_id:{
					user_id,
					movie_id
				}
			}
		})
		res.status(200).json({
			msg:"Película eliminada correctamente del historial.",
			deletedWatchHistory
		})
	} catch (error) {
		res.status(500).json({
			msg:"Ha ocurrido un error al eliminar la película del historial.",
			error
		})
	}
}

const getUserMovies = async (req = request, res = response) => {
	const user_id = req.params.userId;

	if (!user_id) {
		return res.status(400).json({
			msg: 'No hay id en la solicitud',
		});
	}
	try {
		const userMovies = await prisma.movie.findMany({
			where: {
				user_id,
				productionYear: {
					not: 0,
				},
				explicitContent: false,
				movieUrl: {
					not: null,
				},
			},
		});

		if (!userMovies || userMovies.length === 0) {
			return res.status(404).json({
				msg: 'No se han encontrado películas de este usuario',
			});
		}

		res.status(200).json({
			userMovies,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al obtener las películas',
			error,
		});
	}
};

const updateGenreToMovie = async (req = request, res = response) => {
	try {
		const { genres = [], movie_id } = req.body;

		const genresWithId = genres.map(genre => ({
			genre_id: genre,
		}));

		if (!genres || genres.length < 1) {
			return res.status(400).json({
				msg: 'Faltan los géneros en la solicitud',
			});
		}

		const updatedMovie = await prisma.movie.update({
			where: {
				movie_id: movie_id,
			},
			data: {
				genres: {
					set: [],
					connect: genresWithId,
				},
			},
			include: {
				genres: true,
			},
		});

		if (!updatedMovie) {
			return res.status(404).json({
				msg: 'No fue posible actualizar los géneros, película no encontrada.',
			});
		}

		return res.status(200).json({
			msg: 'Géneros actualizados con éxito.',
			updatedGenres: updatedMovie.genres,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al intentar actualizar los géneros.',
			error,
		});
	}
};

const addMovieToUserList = async (req = request, res = response) => {
	const { movie_id, user_id } = req.body;
	try {
		const movieAddedToUserList = await prisma.userList.create({
			data: {
				movie_id,
				user_id,
			},
		});

		res.status(201).json({
			movieAddedToUserList,
			msg: 'Película agregada correctamente.',
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al agregar la película a la lista.',
			error,
		});
	}
};

const deleteMovieFromUserList = async (req = request, res = response) => {
	const { movie_id, user_id } = req.body;
	if(!movie_id || !user_id){
		return res.status(400).json({
			msg:"Falta el id en la solicitud"
		})
	}
	try {
		const deletedMovieFromUserList = await prisma.userList.delete({
			where: {
				user_id_movie_id: {
					user_id,
					movie_id,
				},
			},
		});

		res.status(200).json({
			msg: 'Película eliminada de la lista correctamente.',
			deletedMovieFromUserList,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al eliminar la película de la lista.',
			error,
		});
	}
};

const deleteUserList = async (req = request, res = response) => {
	const user_id = req.params.userId;

	if (!user_id) {
		return res.status(400).json({
			msg: 'No hay id del usuario en la solicitud',
		});
	}

	try {
		const deletedUserListCount = await prisma.userList.deleteMany({
			where: {
				user_id,
			},
		});

		res.status(200).json({
			msg: 'Lista borrada con éxito.',
			deletedUserListCount,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al borrar la lista.',
			error,
		});
	}
};

const getUserList = async (req = request, res = response) => {
	const user_id = req.params.userId;

	if (!user_id) {
		return res.status(400).json({
			msg: 'No hay id de usuario en la solicitud',
		});
	}

	try {
		const userList = await prisma.userList.findMany({
			where: {
				user_id,
			},
			include: {
				movie: true,
			},
		});

		if (!userList || userList.length === 0) {
			return res.status(404).json({
				msg: 'Aún no tienes películas agregadas a tu lista.',
			});
		}

		res.status(200).json({
			userList,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ha ocurrido un error al obtener la lista del usuario',
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
	getGenresWithMovies,
	getWatchHistory,
	getUserMovies,
	updateGenreToMovie,
	getUserList,
	addMovieToUserList,
	deleteMovieFromUserList,
	deleteUserList,
	deleteWatchHistory,
	deleteMovieFromWatchHistory
};
