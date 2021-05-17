const express = require('express');
const path = require('path');
const { db } = require('./db');
const {secretsManager} = require('./secrets');
const app = express();

// making sure we serve static files
app.use(express.static('public'));

const port = process.env.COWIN_API_PORT;

secretsManager.accessSecrets().then(()=>{
    app.listen(port,()=>{
        console.log(`listening at http://localhost:${port}`);
    });
});

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/register-email',(req,res)=>{
    // this should send a verification mail first, but we are simulating the login instead
    res.send("OTP has been sent to the email!");
});

app.get('/dashboard', (req,res)=>{
    res.sendFile(path.join(__dirname, '/dashboard.html'));
});

app.get('/users/add',async (req,res)=>{
    const data = req.query,
        districtId=await getDistrictId(data.state,data.district),
        isVerified=await isUserVerified(data.email),
        vaccine=data.vaccine===undefined ? null : data.vaccine;

    db.insertUser(data.email,districtId,vaccine,data.age,isVerified);
    res.send('Hello');
});

async function getDistrictId(state,district){
    const result = await db.getDistrictId(state,district);
    if(!result.length)
        return false;

    return result[0].id;
}

async function isUserVerified(email){
    const result = await db.isUserVerified(email);
    return result[0].count > 0;
}