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

    const gradientBackground = `
            background: linear-gradient(to right, #2A0541, #870AB2);
            padding: 20px;
            text-align: center;
            color: white;
        `;

    const titleStyle = `
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
    `;

    const messageStyle = `
        font-size: 18px;
        margin-bottom: 20px;
    `;

    const rectangleStyle = `
        background-color: #f4f4f4;
        padding: 10px;
        border-radius: 5px;
        display: inline-block;
    `;

    const htmlContent = `
        <html>
            <body style="${gradientBackground}">
                <div style="${titleStyle}">Gracias por registrarte!</div>
                <p style="${messageStyle}">Bienvenido a cine-independiente. Este es tu código de verificación:</p>
                <div style="${rectangleStyle}">
                    <h3 style="color: #007bff; margin: 0;">${verificationCode}</h3>
                </div>
                <p>¡Gracias por utilizar nuestro servicio!</p>
            </body>
        </html>
    `;

    await transporter.sendMail({
        from:'noreply-cineindependiente <noreplycineindependiente@gmail.com>',
        to: email,
        subject:'Tu código de verificación',
        html:htmlContent
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

const notificationEmail = async (email, subject, text) => {
    
    try { 
        await transporter.sendMail({
            from: 'noreply-cineindependiente <noreplycineindependiente@gmail.com>',
            to: email,
            subject: subject,
            text:text
        });
        return 'Mensaje enviado con éxito';
    } catch (error) {
        throw new Error('Error al enviar el correo: ' + error.message);
    }
};


module.exports = {
    transporter,
    sendVerificationCode,
    existingEmail,
    notificationEmail
}