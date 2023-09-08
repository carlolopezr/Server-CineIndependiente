const { request, response } = require('express')
const { prisma } = require('../database/config')
const bcryptjs = require('bcryptjs');
const { requestEmailVerification, sendVerificationCode } = require('../helpers/emails');


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
        await prisma.user.create({data:user})
        await requestEmailVerification(user.email)
            .then((code) => {
                sendVerificationCode(user.email, code)
        })
    } catch (error) {
        console.log(error);
    }
    res.json(user)
}

const getUsers = async(req=request, res=response) => {

    const users = await prisma.user.findMany()
    res.json(users)

}

module.exports = {
    getUser,
    postUser,
    getUsers
}