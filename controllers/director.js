const { request, response } = require('express');
const { prisma } = require('../database/config');

const updateDirector = async(req=request, res=response) => {
    try {
        const {directors=[], movie_id} = req.body

        if (directors.length < 1) {
            return res.status(400).json({
                msg:'Debe haber al menos 1 director'
            })        
        }

        for (const director of directors) {
            if (!director.name) {
                return res.status(400).json({
                    msg:'El nombre del director no puede estar vacío'
                })
            }
        }

        const updatedMovie = await prisma.movie.update({
            where: {
                movie_id:movie_id
            },
            data:{
                directors:{
                    deleteMany:{},
                    createMany:{
                        data:directors
                    }
                }
            },
            include: {
                directors:{
                    orderBy: {
                        name:'asc'
                    }
                }
            }
        })  

        return res.status(200).json({
            msg:'Directores actualizados con éxito',
            updatedDirectors:updatedMovie.directors
        })


    } catch (error) {
        res.status(500).json({
            msg:'Hubo un error al actualizar los directores',
            error
        })
    }
}


module.exports = {
    updateDirector
}