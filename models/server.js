const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload')

// const { dbConnection } = require('../database/config')

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.paths = {
        }

        // Conectar a base de datos
        this.conectarDB()

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }

    // async conectarDB() {
    //     await dbConnection()
    // }

    middlewares() {

        // CORS
        this.app.use(cors());

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
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }

}

module.exports = Server;
