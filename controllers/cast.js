const { request, response } = require('express');
const { prisma } = require('../database/config');


// const updateCast = async(req=request, res=response) => {

//     try {
//         const {cast = []} = req.body
//         const updatedCast = []

//         for (const actor of cast) {

//             if(!actor.name){
//                 const error = new Error('El campo name no puede estar vacio')
//                 error.status = 400
//                 throw error
//             }

//             const updatedActor = await prisma.actor.update({
//                 where: {
//                     actor_id: actor.actor_id
//                 },
//                 data: {
//                     name:actor.name
//                 }
//             }).catch(err => {

//                 if (err.code == 'P2025') {
//                     const error = new Error('No se pudo encontrar al usuario')
//                     error.status = 404
//                     throw error 
//                 }
//                 throw err      
//             })
            
//             updatedCast.push(updatedActor)
            
//         }

//         return res.status(200).json({
//             msg:'Cast actualizado con éxito',
//             updatedCast
//         })

//     } catch (error) {
//         res.status(error.status || 500).json({
//             msg: 'Error al actualizar el cast',
//             error: error.message
//         })
//     }
// }


const updateCast = async(req=request, res=response) => {

    try {
        const {cast = [], movie_id} = req.body

        if (cast.length < 1) {
            return res.status(400).json({
                msg:'Debe haber al menos 1 actor en el elenco'
            })        
        }

        for (const actor of cast) {
            if (!actor.name) {
                return res.status(400).json({
                    msg:'El nombre del actor no puede estar vacío'
                })
            }
        }

        const updatedMovie = await prisma.movie.update({
            where: {
                movie_id:movie_id
            },
            data:{
                cast:{
                    deleteMany:{},
                    createMany:{
                        data:cast
                    }
                }
            },
            include: {
                cast:{
                    orderBy:{
                        name:'asc'
                    }
                }    
            }
        })  

        return res.status(200).json({
            msg:'Elenco actualizado con éxito',
            updatedCast:updatedMovie.cast
        })


    } catch (error) {
        res.status(500).json({
            msg:'Hubo un error al intentar actualizar el elenco',
            error
        })
    }
}

module.exports = {
    updateCast
}