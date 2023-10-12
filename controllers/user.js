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
		emailVerified
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

		if (!user.active) {
			await prisma.user.update({
				where: {
					user_id: user.user_id,
				},
				data: {
					active: true,
				},
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
			avatarUrl: user.avatarUrl,
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

const updateUser = async (req = request, res = response) => {
	const { data, user_id } = req.body;

	try {
		const updatedUser = await prisma.user.update({
			where: {
				user_id,
			},
			data: data,
		});

		if (!updatedUser) {
			return res.status(404).json({
				msg: 'Usuario no encontrado',
			});
		}

		return res.status(200).json({
			msg: 'Usuario actualizado correctamente',
			updatedUser,
		});
	} catch (error) {
		res.status(500).json({
			msg: 'Ocurrio un error al actualizar el usuario',
			error,
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
			avatarUrl: user.avatarUrl,
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

const sendNotificationEmail = async (req = request, res = response) => {
	try {
		const { email, subject, text } = req.body;
		await notificationEmail(email, subject, text);
		return res.status(200).json({
			msg: 'Correo de notificación enviado con éxito',
		});
	} catch (error) {
		return res.status(500).json({
			msg: 'Hubo un error al enviar el correo de notificación',
		});
	}
};

const passwordChangeRequest = async (req=request, res=response) => {

	try {
		const {email} = req.body

		if (!email) {
			return res.status(400).json({
				msg:'Falta el email en la solicitud'
			})
		}

		const user = await prisma.user.findUnique({
			where:{
				email:email
			}
		})

		if (!user) {
			return res.status(400).json({
				msg:'Error al encontrar el usuario en la base de datos'
			})	
		}

		const salt = bcryptjs.genSaltSync();
		let resetToken = crypto.randomBytes(32).toString('hex')
		const hash = bcryptjs.hashSync(resetToken, salt)

		let expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);


		const token = await prisma.token.upsert({
			where: {
				email: user.email
			},
			create: {
				user_id: user.user_id,
				email: user.email,
				token:hash
			},
			update: {
				token:hash,
				expiresAt: expiresAt
			}
			
		}).catch((err) => {
			console.log(err);
			throw new Error('Error al intentar crear el token')
		})

		const link = `${process.env.CINE_INDEPENDIENTE_CLIENT}/auth/reset-password?token=${token.token}&id=${token.user_id}`

		const text = `Hemos recibido una solicitud de cambio de contraseña para el usuario: ${email}, 
		para cambiar tu contraseña puedes hacer clic en el siguiente link: ${link} \n Si no has sido tu puedes ignorar este mensaje`
		const subject = 'Cambio de contraseña cine-independiente.vercel.app'
		await notificationEmail(email, subject, text)
		
		return res.status(200).json({
			msg:'Solicitud realizada con éxito'
		})
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			msg:'Ha ocurrido un error intentelo de nuevo más tarde',
			error
		})
	}
	
}

const resetPassword = async (req=request, res=response) => {

	const {newPassword,  user_id} = req.body
	const salt = bcryptjs.genSaltSync();

	try {
		const user = await prisma.user.findUniqueOrThrow({
			where: {
				user_id:user_id
			}
		})

		const token = await prisma.token.findUniqueOrThrow({
			where: {
				user_id:user_id
			}
		})

		if(!newPassword) {
			return res.status(400).json({
				msg:'Falta el newPassword en la solicitud'
			})
		}

		const passwordErrors = validatePassword(newPassword);

		if (passwordErrors.length > 0) {
			return res.status(400).json({ errors: passwordErrors });
		}

		if (token.expiresAt < Date.now()) {
			return res.status(400).json({
				msg:'El token ha expirado, por favor solicite uno nuevo'
			})
		}

		const hashedPassword = bcryptjs.hashSync(newPassword, salt)

		const updatedUser = prisma.user.update({
			where:{
				user_id:user_id
			},
			data: {
				password: hashedPassword
			}
		}).catch((err) => {
			console.log(err, 'Error en updatedUser');
		})

		const { password, ...updatedUserWithOutPassword} = await updatedUser;

		await prisma.token.delete({
			where: {
				user_id:user_id
			}
		})

		return res.status(200).json({
			msg:'Usuario updateado con éxito',
			updatedUserWithOutPassword
		})

	} catch (error) {
		return res.status(500).json({
			msg:'Hubo un error al procesar la solicitud',
			error: error.message
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
	sendNotificationEmail,
	updateUser,
	passwordChangeRequest,
	resetPassword
};
