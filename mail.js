const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({username: 'api', key:  process.env.MAILGUN_KEY});

async function sendMail(email){
    return new Promise((resolve)=>{
        mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: [email],
            subject: "Cowin Notifier",
            text: "A slot just opened uup on the Cowin App!",
            html: "<h1>A slot just opened uup on the Cowin App!</h1>"
          })
          .then((msg) => {
              console.log(msg);
              resolve();
            }) // logs response data
          .catch(err => console.log(err)); // logs any error
    });
}

exports.mailer={
    sendMail
}