const {SecretManagerServiceClient} = require('@google-cloud/secret-manager'),
    client = new SecretManagerServiceClient();

require('dotenv').config();

async function accessSecrets(){
    if(process.env.NODE_ENV==='production'){
        let secrets=['COWIN_DB_HOST','COWIN_DB_PORT','COWIN_DB_USERNAME','COWIN_DB_PASSWORD','COWIN_DB_DATABASE','COWIN_MAILGUN_KEY','COWIN_MAILGUN_DOMAIN','COWIN_SENDER_EMAIL','COWIN_SENDER_NAME','COWIN_MIN_NOTIFY_DELAY_SECS'];
        for(secret of secrets){
            const [version] = await client.accessSecretVersion({
                name: `projects/${process.env.COWIN_PROJECT_ID}/secrets/${secret}/versions/latest`
            });
        
            // Extract the payload as a string.
            const payload = version.payload.data.toString();
    
            //Add the secret to the process.env
            process.env[secret]=payload;
        }
    }
}

exports.secretsManager={
    accessSecrets
}