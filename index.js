const express = require('express');
const { db } = require('./db');
const app = express();
const port = 3000;

app.get('/', (req,res)=>{
    res.send('Hello World!');
});

app.get('/users/add',async (req,res)=>{
    const data = req.query,
        districtId=await getDistrictId(data.state,data.district),
        isVerified=await isUserVerified(data.email),
        vaccine=data.vaccine===undefined ? null : data.vaccine;

    db.insertUser(data.email,districtId,vaccine,data.age,isVerified);
    res.send('Hello');
});

app.listen(port,()=>{
    console.log(`listening at http://localhost:${port}`);
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