const { request, response } = require('express');
const jwt = require('jsonwebtoken');

const validateJWT = (req = request, res = response, next) => {
	//x-token in headers
	const token = req.header('x-token');
	if (!token)
		return res.status(401).json({
			ok: false,
			msg: 'No hay token en la solicitud',
		});

	try {
		const { user_id, name } = jwt.verify(token, process.env.SECRET_JWT_SEED);

		req.user_id = user_id;
		req.name = name;
	} catch (error) {
		return res.status(401).json({
			ok: false,
			msg: 'Token invalido',
		});
	}

	next();
};

module.exports = {
	validateJWT,
};
