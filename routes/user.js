const { Router } = require('express');
const {
	getUser,
	postUser,
	getUsers,
	requestEmailVerification,
	checkVerificationCode,
	revalidateToken,
	loginUser,
	sendNotificationEmail,
	updateUser,
	passwordChangeRequest,
	resetPassword,
	getRecommendedMoviesByGenres,
} = require('../controllers/user');
const { validateJWT } = require('../middlewares/validateJWT');
const { body } = require('express-validator');
const { validarCampos } = require('../middlewares/validarCampos');

const router = Router();

router.get('/', getUser);

router.put('/update-user', updateUser);

router.post(
	'/',
	[
		body('email', 'El formato del correo ingresado no es válido').isEmail(),
		body('password', 'Por favor ingrese su contraseña').not().isEmpty(),
		body('name', 'Por favor ingrese su nombre').not().isEmpty(),
		body('lastname', 'Por favor ingrese su apellido').not().isEmpty(),
		validarCampos,
	],
	postUser
);

router.post(
	'/login',
	[
		body('email', 'El formato del correo ingresado no es válido').isEmail(),
		body('password', 'Por favor ingrese su contraseña').not().isEmpty(),
		validarCampos,
	],
	loginUser
);

router.get('/users', getUsers);

router.get('/refresh', validateJWT, revalidateToken);

router.post(
	'/emailVerification',
	[
		body('email', 'El formato del correo ingresado no es válido').isEmail(),
		body('email', 'Falta el correo en la solicitud').not().isEmpty(),
		validarCampos,
	],
	requestEmailVerification
);

router.post(
	'/checkVerificationCode',
	[
		body('email', 'El formato del correo ingresado no es válido').isEmail(),
		body('email', 'Falta el correo en la solicitud').not().isEmpty(),
		body('verificationCode', 'El código de verificación debe ser un número').isNumeric(),
		body('verificationCode', 'Falta el código de verificación en la solicitud').not().isEmpty(),
		validarCampos,
	],
	checkVerificationCode
);

router.post(
	'/send-notification-email',
	[
		body('email', 'Falta el correo en la solicitud').not().isEmpty(),
		body('subject', 'Falta el subject en la solicitud').not().isEmpty(),
		body('text', 'Falta el mensaje en la solicitud').not().isEmpty(),
		validarCampos,
	],
	sendNotificationEmail
);

router.post('/password-change-request',[
	body('email', 'Falta el correo en la solicitud').not().isEmpty(),
	validarCampos
], passwordChangeRequest)

router.post('/reset-password', resetPassword)

router.get('/get-recommended-movies-bygenre', [
	body('user_id', 'Falta el user_id en la solicitud').notEmpty(),
	validarCampos
],getRecommendedMoviesByGenres)

module.exports = router;
