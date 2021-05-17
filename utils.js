const { db } = require('./db');
let districts=[];

async function populateDistricts(){
    districts=await db.getDistricts();
}

function getDistricts(){
    return districts;
}

function getDistrictById(id){
    return districts.find((dist)=>{
        return dist.id===id;
    });
}

exports.utils={
    populateDistricts,
    getDistricts,
    getDistrictById
}