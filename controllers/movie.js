const { request, response } = require('express');
const { prisma } = require('../database/config');

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
					create: cast,
				},
				writers: {
					create: writers,
				},
				directors: {
					create: directors,
				},
				genres: {
					connect: genresWithId,
				},
			},
		});
		res.status(201).json(createdMovie);
	} catch (error) {
		console.log(error);
		res.status(500).json({
			msg: 'Ocurrio un error al guardar la información de la película',
		});
	}
};

const updateMovie = async(req = request, res = response) => {

	try {
		const { date, user_id, data } = req.body
		const updateMovie = await prisma.movie.updateMany({
			where: {
				date: date,
				user_id: user_id
			},
			data: data
		})
		.catch((err) => {
			res.status(400).json({
				msg:`Hubo un error al intentar encontrar la película en la base de datos: ${err}`
			})
		})

		res.status(200).json({
			msg:'Película actualizada correctamente',
			updateMovie
		})

	} catch (error) {
		res.status(500).json({
			msg:`Hubo un error al intentar actualizar la película: ${error}`
		})
	}
}

const getAllMovies = async (req = request, res = response) => {
	try {
		const movies = await prisma.movie.findMany();
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

module.exports = {
	postMovie,
	postGenre,
	getAllGenres,
	getAllMovies,
	updateMovie
};
