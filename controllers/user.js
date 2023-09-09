const { request, response } = require('express')
const { prisma } = require('../database/config')
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
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

    const passwordErrors = validatePassword(user.password);

    if (passwordErrors.length > 0) {
        return res.status(400).json({ errors: passwordErrors });
    }
    // 8 caracteres minimo, 1 mayuscula y 1 caracter raro
    user.password = bcryptjs.hashSync(user.password, salt)

    try {
        existingEmail(user.email)
        await prisma.user.create({data:user})
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword)
    } catch (error) {
        res.status(400).json({msg:'No se pudo realizar la solicitud'});
    }
    
}

const requestEmailVerification = async(req=request, res=response) => {
    
    const { email } = req.body

    if (!email) {
        throw new Error('Se requiere un email')
    }

    const verificationCode = crypto.randomInt(100000,999999)
    const emailVerification = {
        email,
        verificationCode
    }

    try {

        await prisma.emailVerification.deleteMany({where: {
            email
        }})

        await prisma.emailVerification.create({data:emailVerification})
        await sendVerificationCode(emailVerification.email, emailVerification.verificationCode)
        res.status(200).json({msg: 'Correo de verificación enviado correctamente'})
    } catch (error) {
        res.status(400).json({msg:'No se pudo enviar el correo de verificación'})
    } 
} 

const getUsers = async(req=request, res=response) => {

    const users = await prisma.user.findMany()
    res.json(users)

}

const checkVerificationCode = async(req=request, res=response) => {

    const {email, verificationCode} = req.body

    try {

        const check = await prisma.emailVerification.findFirst({where: {
            email, verificationCode
        }})
        

        if (!check || check.expiresAt < Date.now()) {
            throw new Error('El código no es correcto o ha expirado')
        }

        const user = await prisma.user.update({
            where: {
                email:email
            },
            data: {
                emailVerified: true
            }
        })

        await prisma.emailVerification.deleteMany({where: {email}})
           
        console.log(user, 'AQUI ESTA EL USUARIO');

        const { password, updatedAt, createdAt, emailVerified, ...userNew } = user;

        res.status(200).json(userNew)

    } catch (error) {
        res.status(400).json({
            error: error.message
        })
    }
}

const validatePassword = (password) => {
    const uppercaseRegex = /[A-Z]/;
    const specialCharacterRegex = /[!@#$%^&*(),.?":{}|<>]/;
  
    const hasUppercase = uppercaseRegex.test(password);
    const hasSpecialCharacter = specialCharacterRegex.test(password);
    
    const errors = [];
  
    if (!hasUppercase) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
  
    if (!hasSpecialCharacter) {
      errors.push('La contraseña debe contener al menos un caracter especial');
    }

    if (password.length < 8) {
        errors.push('La contraseña debe tener al menos 8 caracteres')
    }
  
    return errors;
  }

module.exports = {
    getUser,
    postUser,
    getUsers,
    requestEmailVerification,
    checkVerificationCode
}