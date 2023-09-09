const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')


class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
            user: '/api/user'
        }

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }


    middlewares() {

        const corsOptions = {
            origin: '*', // Permitir solicitudes desde cualquier origen
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
            preflightContinue: false, // No habilitar solicitudes preflight
        };

        this.app.use(cors(corsOptions)); // Habilitar CORS para todas las rutas OPTIONS


        // Lectura y parseo del body
        this.app.use(express.json());

        // Directorio Público
        this.app.use(express.static('public'));

        // Carga de archivos
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/',
            createParentPath: true
        }));

    }

    routes() {
        //Rutas aquí
        this.app.use(this.paths.user, require('../routes/user'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;
