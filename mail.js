const sgMail = require('@sendgrid/mail');

async function sendMail(email, foundSessions) {
    return new Promise((resolve) => {
        sgMail.setApiKey(process.env.COWIN_SENDGRID_API_KEY);
        const msg = {
            to: email, // Change to your recipient
            from: `${process.env.COWIN_SENDER_NAME} <${process.env.COWIN_SENDER_EMAIL}>`, // Change to your verified sender
            subject: 'A slot just opened up on the Cowin App!',
            content: [
                {
                    type:'text/html',
                    value: getHtml(foundSessions)
                }
            ]
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

/**
 * Returns the text-only version to be sent in the mail
 * @param {array} sessions 
 */
function getText(sessions){
    return sessions.reduce((prev, cur)=>{
        return prev + `|--Center: ${cur.center}\n|--Address: ${cur.address}\n|--Vaccine:${cur.vaccine}\n|--Available:${cur.available}\n|--ID:${cur.id}\n|--PIN:${cur.pincode}\n|--Date: ${cur.date}`;
    },'');
}

/**
 * Returns the HTML to be sent in the mail
 * @param {array} sessions 
 */
function getHtml(sessions){
    let html = `
    <html>
        <body style="background:#f3f3f3;">
            <table style="font-family: arial;width:100%;">
                <tbody>`;
    html += sessions.map((session)=>{
        return `
            <tr>
                <td>
                    <div class="box" style="max-width: 600px;margin: 20px auto;border: 1px solid #afafaf;padding: 0;border-radius: 8px;">
                        <div class="title" style="padding: 10px 20px;background: #1a73e8;color: #fff;border-radius: 8px 8px 0 0;">
                            Center: ${session.center}
                        </div>
                        <div class="details" style="padding:10px 20px; border-radius: 0 0 8px 8px;">
                            Available: ${session.available}<br />
                            Address: ${session.address}<br />
                            Pincode: ${session.pincode}<br />
                            Date: ${session.date}<br />
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    html += `
                </tbody>
            </table>
        </body>
    </html>
    `;

    return html;
}

exports.mailer = {
    sendMail
}