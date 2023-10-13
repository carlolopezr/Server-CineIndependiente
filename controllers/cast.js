const { request, response } = require('express');
const { prisma } = require('../database/config');


const updateCast = async(req=request, res=response) => {

    try {
        const {cast = []} = req.body
        const updatedCast = []

        for (const actor of cast) {

            if(!actor.name){
                const error = new Error('El campo name no puede estar vacio')
                error.status = 400
                throw error
            }

            const updatedActor = await prisma.actor.update({
                where: {
                    actor_id: actor.actor_id
                },
                data: {
                    name:actor.name
                }
            }).catch(err => {

                if (err.code == 'P2025') {
                    const error = new Error('No se pudo encontrar al usuario')
                    error.status = 404
                    throw error 
                }
                throw err      
            })
            
            updatedCast.push(updatedActor)
            
        }

        return res.status(200).json({
            msg:'Cast actualizado con éxito',
            updatedCast
        })

    } catch (error) {
        res.status(error.status || 500).json({
            msg: 'Error al actualizar el cast',
            error: error.message
        })
    }
}

module.exports = {
    updateCast
}