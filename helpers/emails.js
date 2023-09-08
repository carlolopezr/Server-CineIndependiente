const { createTransport } = require("nodemailer");
const { prisma } = require("../database/config");

const transporter = createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: 'clopez9518@gmail.com',
        pass: process.env.SMTP_PASSWORD
    }
})

const sendVerificationCode = async(email, verificationCode) => {
    
    console.log(verificationCode);
    await transporter.sendMail({
        from:'clopez9518@gmail.com',
        to: email,
        subject:'Tu código de verificación',
        text:`Este es tu código de verificación ${verificationCode}`
    })
}


const existingEmail = async(email) => {
    
    const existingEmail = await prisma.user.findUnique({where: {
        email:email,
    }})

    if (existingEmail) {
        throw new Error('El correo ingresado no es válido')
    }
}


module.exports = {
    transporter,
    sendVerificationCode,
    existingEmail
}