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

function getStateDistrictPair(){
    let states={};
    districts.forEach((row)=>{
        if(states[row.state]===undefined){
            states[row.state]=[row.district];
        }
        else
            states[row.state].push(row.district);
    });

    return states;
}

exports.utils={
    populateDistricts,
    getDistricts,
    getDistrictById,
    getStateDistrictPair
}