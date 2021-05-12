const mysql = require('mysql');
const moment = require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('Asia/Kolkata');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


async function getUsers() {
    return new Promise((resolve) => {

        connection.query("SELECT * FROM users where (last_notified is null or last_notified < DATE_SUB(NOW(), INTERVAL '1' HOUR))", function (error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
}

async function updateUserNotified(user){
    return new Promise((resolve)=>{
        const time=moment().format('YYYY-MM-DD hh:mm:ss');
        console.log('updating last notified for user'+user.id+" to"+time);
        connection.query("UPDATE users SET last_notified=? WHERE users.id=?",[time,user.id],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function insertDistrict(row){
    return new Promise((resolve)=>{
        const time=moment().format('YYYY-MM-DD hh:mm:ss');
        connection.query("INSERT INTO districts VALUES(?,?,?,?,?)",[row.id,row.state,row.district,time,time],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function getDistrictId(state,district){
    return new Promise((resolve)=>{
        connection.query("SELECT id from districts WHERE state=? AND district=?",[state,district],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve(results);
        });
    });
}

function isUserVerified(email){
    return new Promise((resolve)=>{
        connection.query("SELECT count(*) as count FROM users WHERE email=? AND verified_at IS NOT NULL",[email],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve(results);
        });
    });
}

function insertUser(email,districtId,vaccine,minAge,isVerified){
    return new Promise((resolve)=>{
        const time=moment().format('YYYY-MM-DD hh:mm:ss'),
            verifiedAt = isVerified ? time : null;

        console.log('Inserting user');
        connection.query("INSERT INTO users(email,district_id,vaccine_pref,min_age,verified_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?)",[email,districtId,vaccine,minAge,verifiedAt,time,time],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function connect(){
    connection.connect();
}

function disconnect(){
    connection.end();
}

exports.db={
    getUsers,
    updateUserNotified,
    insertDistrict,
    getDistrictId,
    isUserVerified,
    insertUser,
    connect,
    disconnect
};