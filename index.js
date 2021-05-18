const express = require('express');
const path = require('path');
const moment = require('moment-timezone');
const { db } = require('./db');
const {secretsManager} = require('./secrets');
const {utils} = require('./utils');
const app = express();
const port = process.env.COWIN_API_PORT;

moment.tz.setDefault('Asia/Kolkata');

// making sure we serve static files
app.use(express.static('public'));

//ejs setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

secretsManager.accessSecrets().then(async ()=>{
    // connect to db before anything
    await db.connect();

    // let's fetch the districts as it's a one time operation
    await utils.populateDistricts();

    // start the server
    app.listen(port,()=>{
        console.log(`listening at http://localhost:${port}`);
    });
});

app.get('/', (req,res)=>{
    res.render('index');
});

app.post('/register-email',(req,res)=>{
    // this should send a verification mail first, but we are simulating the login instead
    res.send("OTP has been sent to the email!");
});

app.get('/dashboard', async (req,res)=>{
    const user=req.query.user;
    let entries = await db.getUserEntries(user);
    const states= utils.getStateDistrictPair();
    entries.map((entry)=>{
        let row=utils.getDistrictById(entry.district_id);
        entry.state=row.state;
        entry.district=row.district;
        entry.status='Monitoring';
        entry.last_checked= entry.last_checked===null ? 'Never' : moment(row.last_checked).fromNow();
        entry.vaccine = entry.vaccine_pref===null ? 'No Preference' : (entry.vaccine_pref.charAt(0).toUpperCase() + entry.vaccine_pref.slice(1));
    });
    res.render('dashboard',{
        user,
        entries,
        states
    });
});

app.get('/users/add',async (req,res)=>{
    const data = req.query,
        districtId=await getDistrictId(data.state,data.district),
        vaccine=data.vaccine=="-1" ? null : data.vaccine;

    db.insertUser(data.email,districtId,vaccine,data.age);
    res.send('Hello');
});

app.get('/requests/remove',async (req,res)=>{
    const reqId=req.query.request_id,
        email=req.query.email;

    await db.removeRequest(reqId);
    res.redirect(`/dashboard?user=${email}`);
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