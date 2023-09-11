const { request, response } = require('express');
const { prisma } = require('../database/config');
const { generateJWT } = require('../helpers/generateJWT');

const loginUser = async (req = request, res = response) => {
	const { email, password } = req.body;

	try {
		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			return res.status(400).json({
				ok: false,
				msg: 'Email o contraseña incorrectos',
			});
		}

		//Confirmar contraseñas
		const isValidPassword = bcryptjs.compareSync(password, user.password);

		if (!isValidPassword) {
			return res.status(400).json({
				ok: false,
				msg: 'Email o contraseña incorrectos',
			});
		}

		//Generar token
		const token = await generateJWT(user.id, user.name);

		const loggedUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			lastname: user.lastname,
			emailVerified: user.emailVerified,
		};

		res.json({
			ok: true,
			user: loggedUser,
			token,
		});
	} catch (error) {
		res.status(500).json({
			ok: false,
			msg: 'Hubo un problema en el servidor, intentelo de nuevo más tarde',
		});
	}
};


module.exports = {
    loginUser
}