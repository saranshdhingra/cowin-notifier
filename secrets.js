const {SecretManagerServiceClient} = require('@google-cloud/secret-manager'),
    client = new SecretManagerServiceClient();

// let globalSecrets=new Map();

async function accessSecrets(){
    let secrets=['COWIN_DB_HOST','COWIN_DB_PORT','COWIN_DB_USERNAME','COWIN_DB_PASSWORD','COWIN_DB_DATABASE','COWIN_MAILGUN_KEY','COWIN_MAILGUN_DOMAIN','COWIN_SENDER_EMAIL','COWIN_SENDER_NAME','COWIN_MIN_NOTIFY_DELAY_SECS'];
    for(secret of secrets){
        const [version] = await client.accessSecretVersion({
            name: `projects/${COWIN_PROJECT_ID}/secrets/${secret}/versions/latest`
        });
    
        // Extract the payload as a string.
        const payload = version.payload.data.toString();

        // globalSecrets.set(secret,payload);
        process.env[secret]=payload;
    }
}

// async function getSecretValue(name){

// }

accessSecrets();

exports.secretsManager={
    accessSecrets
}