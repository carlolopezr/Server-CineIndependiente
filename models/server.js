const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

class Server {
	constructor() {
		this.app = express();
		this.port = process.env.PORT;

		this.paths = {
			user: '/api/user',
			movie: '/api/movie',
			director: '/api/director',
			cast: '/api/cast',
			writer: '/api/writer'
		};

		// Middlewares
		this.middlewares();

		// Rutas de mi aplicación
		this.routes();
	}

	middlewares() {
		// CORS
		this.app.options('*', cors());
		this.app.use(cors());

		// Lectura y parseo del body
		this.app.use(express.json());

		// Directorio Público
		this.app.use(express.static('public'));

		// Carga de archivos
		this.app.use(
			fileUpload({
				useTempFiles: true,
				tempFileDir: '/tmp/',
				createParentPath: true,
			})
		);
	}

	routes() {
		//Rutas aquí
		this.app.use(this.paths.user, require('../routes/user'));
		this.app.use(this.paths.movie, require('../routes/movie'));
		this.app.use(this.paths.director, require('../routes/director'));
		this.app.use(this.paths.cast, require('../routes/cast'));
		this.app.use(this.paths.writer, require('../routes/writer'))

	}

	listen() {
		this.app.listen(this.port, () => {
			console.log('Servidor corriendo en puerto', this.port);
		});
	}
}

module.exports = Server;
