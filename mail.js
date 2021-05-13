const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
let mg;

async function sendMail(email,foundSessions){
    return new Promise((resolve)=>{
        if(mg===undefined){
            mailgun.client({username: 'api', key:  process.env.COWIN_MAILGUN_KEY});
        }
        
        mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: `${process.env.COWIN_SENDER_NAME} <${process.env.COWIN_SENDER_EMAIL}>`,
            to: [email],
            subject: "Cowin Notifier",
            text: "A slot just opened uup on the Cowin App!",
            html: foundSessions.join('').split('\n').join('<br>')
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