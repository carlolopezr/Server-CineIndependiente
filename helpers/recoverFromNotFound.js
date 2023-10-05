const { prisma } = require('../database/config');

const recoverFromNotFound = async promise => {
	try {
		await promise;
	} catch (e) {
		if (e.code === 'P2025') {
			return null;
		}

		throw e;
	}
};

module.exports = {
	recoverFromNotFound,
};
