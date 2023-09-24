const { request, response } = require('express');
const { prisma } = require('../database/config');

const postMovie = (req = request, res = response) => {
	const { movie, directors, writers, cast, genres } = req.body;
	console.log(movie, directors, writers, cast, genres);
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
};
