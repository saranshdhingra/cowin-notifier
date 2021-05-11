const fs = require('fs');
const fetch = require('node-fetch');
const {db} = require('./db');

const data = JSON.parse(fs.readFileSync('states.json','utf-8'));

let stateIds=[],
    districts=[];

data.states.forEach((state)=>{
    stateIds.push({id:state.state_id,name:state.state_name});
});

// console.log(stateIds);
async function start(){
    console.log(await getDistricts(0));
    console.log('found '+districts.length+' districts');
    await insertDistrict(0);
}

start();

async function insertDistrict(counter){
    const row=districts[counter];
    console.log(`inserting district id:${row.id} state:${row.state} district:${row.district}`);
    await db.insertDistrict(row);
    if(counter<districts.length-1){
        insertDistrict(counter+1);
    }
}

async function getDistricts(counter){
    const headers={
        'accept':'application/json',
        'origin':'https://www.cowin.gov.in',
        'referer':'https://www.cowin.gov.in/',
        'user-agent':'Mozilla/5.0 (X11; CrOS x86_64 13729.84.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.130 Safari/537.36'
    },
        stateId=stateIds[counter].id;

    return new Promise((resolve,reject)=>{
        let url = `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`;
        fetch(url,{headers})
        .then(response => response.json())
        .then(async (response)=>{
            response.districts.forEach((district)=>{
                if(district.district_id!==294 && district.district_id!==265)
                    districts.push({state:stateIds[counter].name,district:district.district_name,id:district.district_id});
            });
            
            if(counter<stateIds.length-1){
                resolve(await getDistricts(counter+1));
            }
            else{
                resolve();
            }
        });
    });
}