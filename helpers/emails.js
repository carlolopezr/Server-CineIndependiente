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
    
    await transporter.sendMail({
        from:'clopez9518@gmail.com',
        to: email,
        subject:'Tu código de verificación',
        text:`Este es tu código de verificación ${verificationCode}`
    })
}


const existingEmail = async(email) => {
    
    try {
        const existingUser = await prisma.user.findUnique({ where: { email: email } });

        if (existingUser) {
            throw new Error('El correo ingresado no es válido');
        }
    } catch (error) {
        // Maneja el error de alguna manera, por ejemplo, registrándolo o devolviéndolo como una respuesta HTTP.
        console.error(error);
        throw error; // Esto puede ser opcional, dependiendo de cómo quieras manejar el error.
    }
}


module.exports = {
    transporter,
    sendVerificationCode,
    existingEmail
}