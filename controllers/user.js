const { request, response } = require('express')
const { prisma } = require('../database/config')
const bcryptjs = require('bcryptjs');
const {sendVerificationCode, existingEmail } = require('../helpers/emails');


const getUser = async(req = request, res = response) => {
    res.send('Hola Mundo')
}

const postUser =  async(req=request, res=response)=> {

    const {email, name, lastname, password } = req.body;
    const salt = bcryptjs.genSaltSync()
    const emailVerified = false
    const user = {
        email,
        name,
        lastname,
        password,
        emailVerified
    }
    user.password = bcryptjs.hashSync(user.password, salt)

    try {
        existingEmail(user.email)
        await prisma.user.create({data:user})
        res.json(user)
    } catch (error) {
        res.json(error);
    }
    
}

const requestEmailVerification = async(req=request, res=response) => {
    
    const { email } = req.body
    const verificationCode = crypto.randomInt(100000,999999)
    const emailVerification = {
        email,
        verificationCode
    }

    try {
        await prisma.emailVerification.create({data:emailVerification})
        await sendVerificationCode(emailVerification.email, email.verificationCode)
    } catch (error) {
        console.log(error);
    } 
    
    res.status(200).json('Correo de verificación enviado correctamente')
} 

const getUsers = async(req=request, res=response) => {

    const users = await prisma.user.findMany()
    res.json(users)

}

module.exports = {
    getUser,
    postUser,
    getUsers,
    requestEmailVerification
}