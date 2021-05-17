const sgMail = require('@sendgrid/mail')

async function sendMail(email, foundSessions) {
    return new Promise((resolve) => {
        sgMail.setApiKey(process.env.COWIN_SENDGRID_API_KEY)
        const msg = {
            to: email, // Change to your recipient
            from: `${process.env.COWIN_SENDER_NAME} <${process.env.COWIN_SENDER_EMAIL}>`, // Change to your verified sender
            subject: 'A slot just opened uup on the Cowin App!',
            text: foundSessions.join(''),
            html: foundSessions.join('').split('\n').join('<br>'),
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
                resolve();
            })
            .catch((error) => {
                console.error(error)
            });
    });
}



exports.mailer = {
    sendMail
}