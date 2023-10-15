const { request, response } = require('express');
const { prisma } = require('../database/config');


// const updateDirector = async (req = request, res = response) => {
//     try {
//         const { directors = [] } = req.body;
//         const updatedDirectors = [];

//         for (const director of directors) {
//             try {
//                 const updatedDirector = await prisma.director.update({
//                     where: {
//                         director_id: director.director_id
//                     },
//                     data: {
//                         name: director.name,
//                     }
//                 });

//                 updatedDirectors.push(updatedDirector);
//             } catch (err) {
                
//                 console.error(`Error actualizando director con ID ${director.director_id}:`, err);
//                 throw err;
//             }
//         }
//         res.status(200).json({
//             msg: 'Directores actualizados con éxito',
//             updatedDirectors
//         });
//     } catch (error) {
//         res.status(500).json({
//             msg: 'Hubo un error al actualizar los directores',
//             error
//         });
//     }
// };

const updateDirector = async(req=request, res=response) => {
    try {
        const {directors=[], movie_id} = req.body

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
            }
        }).catch((err) => {
            console.log(err);
        })   

        return res.status(200).json({
            msg:'Directores actualizados con éxito',
            updatedMovie
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