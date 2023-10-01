const { request, response } = require('express');
const { prisma } = require('../database/config');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationCode, existingEmail } = require('../helpers/emails');
const { generateJWT } = require('../helpers/generateJWT');
const { notificationEmail } = require('../helpers/emails');

const getUser = async (req = request, res = response) => {
	res.send('Hola Mundo');
};

const postUser = async (req = request, res = response) => {
	const { email, name, lastname, password } = req.body;

	const salt = bcryptjs.genSaltSync();
	const emailVerified = false;
	const user = {
		email,
		name,
		lastname,
		password,
		emailVerified,
	};

	const passwordErrors = validatePassword(user.password);

	if (passwordErrors.length > 0) {
		return res.status(400).json({ errors: passwordErrors });
	}

	// 8 caracteres minimo, 1 mayuscula y 1 caracter raro
	user.password = bcryptjs.hashSync(user.password, salt);

	try {
		await existingEmail(user.email);

		const createdUser = await prisma.user.create({ data: user });

		//Generar token
		const token = await generateJWT(createdUser.user_id, createdUser.name);
		const { password, updatedAt, createdAt, ...userNew } = createdUser;

		const loggedUser = {
			user_id: createdUser.user_id,
			name: createdUser.name,
			lastname: createdUser.lastname,
			email: createdUser.email,
			emailVerified: createdUser.emailVerified,
		};

		res.status(201).json({
			ok: true,
			user: loggedUser,
			token,
		});
	} catch (error) {
		res.status(400).json({ msg: error.message });
	}
};

const requestEmailVerification = async (req = request, res = response) => {
	const { email } = req.body;

	if (!email) {
		throw new Error('Se requiere un email');
	}

	const verificationCode = crypto.randomInt(100000, 999999);
	const emailVerification = {
		email,
		verificationCode,
	};

	try {
		await prisma.emailVerification.deleteMany({
			where: {
				email,
			},
		});

		await prisma.emailVerification.create({ data: emailVerification });
		await sendVerificationCode(emailVerification.email, emailVerification.verificationCode);
		res.status(200).json({ msg: 'Correo de verificación enviado correctamente' });
	} catch (error) {
		res.status(400).json({ msg: 'No se pudo enviar el correo de verificación' });
	}
};

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
		const token = await generateJWT(user.user_id, user.name);

		const loggedUser = {
			user_id: user.user_id,
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

const revalidateToken = async (req = request, res = response) => {
	const { user_id, name } = req;
	const token = await generateJWT(user_id, name);

	try {
		const user = await prisma.user.findUnique({
			where: {
				user_id,
			},
		});

		if (!user) {
			res.status(400).json({
				ok: false,
				msg: 'El usuario no existe',
			});
		}

		const loggedUser = {
			user_id: user.user_id,
			name: user.name,
			email: user.email,
			lastname: user.lastname,
			emailVerified: user.emailVerified,
		};

		res.status(200).json({
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

const getUsers = async (req = request, res = response) => {
	const users = await prisma.user.findMany();
	res.json(users);
};

const checkVerificationCode = async (req = request, res = response) => {
	const { email, verificationCode } = req.body;

	try {
		const check = await prisma.emailVerification.findFirst({
			where: {
				email,
				verificationCode,
			},
		});

		if (!check || check.expiresAt < Date.now()) {
			return res.status(404).json({
				msg: 'El código no es correcto o ha expirado',
			});
		}

		const user = await prisma.user.update({
			where: {
				email: email,
			},
			data: {
				emailVerified: true,
			},
		});

		await prisma.emailVerification.deleteMany({ where: { email } });

		//!Generar token para logear al usuario

		const token = await generateJWT(user.user_id, user.name);

		const { password, updatedAt, createdAt, ...userNew } = user;

		res.status(200).json({
			user: userNew,
			token: token,
		});
	} catch (error) {
		res.status(400).json({
			error: error.message,
		});
	}
};

const validatePassword = password => {
	const uppercaseRegex = /[A-Z]/;
	const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;

	const hasUppercase = uppercaseRegex.test(password);
	const hasSpecialCharacter = specialCharacterRegex.test(password);

	const errors = [];

	if (!hasUppercase) {
		errors.push('La contraseña debe contener al menos una mayúscula');
	}

	if (!hasSpecialCharacter) {
		errors.push('La contraseña debe contener al menos un caracter especial');
	}

	if (password.length < 8) {
		errors.push('La contraseña debe tener al menos 8 caracteres');
	}

	return errors;
};

const sendNotificationEmail = async(req=request, res=response) => {

    try {
        const {email, subject, text} = req.body;
        await notificationEmail(email, subject, text)
        return res.status(200).json({
            msg:'Correo de notificación enviado con éxito'
        })
    } catch (error) {
        return res.status(500).json({
            msg:'Hubo un error al enviar el correo de notificación'
        })
    }
}

module.exports = {
	getUser,
	postUser,
	revalidateToken,
	getUsers,
	requestEmailVerification,
	checkVerificationCode,
	loginUser,
	sendNotificationEmail
};
