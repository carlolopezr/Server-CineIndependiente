const { request, response } = require('express');
const { prisma } = require('../database/config');


// const updateWriter = async(req=request, res=response) => {

//     try {
//         const {writers = []} = req.body
//         const updatedWriters = []

//         for (const writer of writers) {
            
//             if (!writer.name) {
//                 const error = new Error('El name no puede estar vacio')
//                 error.status = 400
//                 throw error
//             }
//             const updatedWriter = await prisma.writer.update({
//                 where: {
//                     writer_id: writer.writer_id
//                 },
//                 data: {
//                     name:writer.name
//                 }
//             })
//             .catch(err => {
//                 const error = new Error('Writer no encontrado')
//                 error.status = 404
//                 throw error
//             })
//             updatedWriters.push(updatedWriter)
//         }

//         return res.status(200).json({
//             msg:'Writers actualizados correctamente',
//             updatedWriters
//         })

//     } catch (error) {
//         res.status(error.status || 500).json({
//             msg:'Ha ocurrido un error al intentar actualizar a los writers',
//             error
//         })
//     }

// }

const updateWriter = async(req=request, res=response) => {

    try {
        
        const {writers = [], movie_id} = req.body

        if (writers.length < 1) {
            return res.status(400).json({
                msg:'Debe haber al menos 1 escritor'
            })        
        }

        for (const writer of writers) {
            if (!writer.name) {
                return res.status(400).json({
                    msg:'El nombre del escritor no puede estar vacío'
                })
            }
        }

        const updatedMovie = await prisma.movie.update({
            where: {
                movie_id:movie_id
            },
            data:{
                writers:{
                    deleteMany:{},
                    createMany:{
                        data:writers
                    }
                }
            },
            include: {
                writers: {
                    orderBy: {
                        name: 'asc'
                    }
                }   
            }
        }) 


        return res.status(200).json({
            msg:'Escritores actualizados con éxito',
            updatedWriters:updatedMovie.writers
        })

    } catch (error) {
        res.status(500).json({
            msg:'Hubo un error al intentar actualizar los escritores',
            error
        })
    }

}



module.exports = {
    updateWriter
}