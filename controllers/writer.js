const { request, response } = require('express');
const { prisma } = require('../database/config');


const updateWriter = async(req=request, res=response) => {

    try {
        const {writers = []} = req.body
        const updatedWriters = []

        for (const writer of writers) {
            
            if (!writer.name) {
                const error = new Error('El name no puede estar vacio')
                error.status = 400
                throw error
            }
            const updatedWriter = await prisma.writer.update({
                where: {
                    writer_id: writer.writer_id
                },
                data: {
                    name:writer.name
                }
            })
            .catch(err => {
                const error = new Error('Writer no encontrado')
                error.status = 404
                throw error
            })
            updatedWriters.push(updatedWriter)
        }

        return res.status(200).json({
            msg:'Writers actualizados correctamente',
            updatedWriters
        })

    } catch (error) {
        res.status(error.status || 500).json({
            msg:'Ha ocurrido un error al intentar actualizar a los writers',
            error
        })
    }

}


module.exports = {
    updateWriter
}