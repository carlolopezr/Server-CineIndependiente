const { createTransport } = require("nodemailer");
const crypto = require('crypto');

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

const requestEmailVerification = async(email) => {

    const existingEmail = await prisma.user.findUnique({where: {
        email:email,
        emailVerified: true
    }})
    if (existingEmail) {
        return
    }
   
    const verificationCode = crypto.randomInt(100000,999999)
    const emailVerification = {
        email,
        verificationCode
    }

    try {
        await prisma.emailVerification.create({data:emailVerification})
        return verificationCode
    } catch (error) {
        console.log(error);
    }  
} 


module.exports = {
    transporter,
    sendVerificationCode,
    requestEmailVerification
}