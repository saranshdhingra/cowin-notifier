const mysql = require('mysql');
const moment = require('moment-timezone');

moment.tz.setDefault('Asia/Kolkata');

let connection;
const timeFormat='YYYY-MM-DD HH:mm:ss';


async function getUsers() {
    return new Promise((resolve) => {
        const minTime = moment().subtract(process.env.COWIN_MIN_NOTIFY_DELAY_SECS,'seconds').format(timeFormat);
        connection.query("SELECT * FROM users where (last_notified is null or last_notified < ?)",[minTime], function (error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
}

async function getUserEntries(email){
    return new Promise((resolve) => {
        connection.query("SELECT * FROM users where email=?",[email], function (error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
}

async function getDistricts(){
    return new Promise((resolve) => {
        connection.query("SELECT * FROM districts", function (error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
}

async function updateUserNotified(user){
    return new Promise((resolve)=>{
        const time=moment().format(timeFormat);
        console.log('updating last notified for user'+user.id+" to"+time);
        connection.query("UPDATE users SET last_notified=? WHERE users.id=?",[time,user.id],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function updateUserChecked(ids){
    return new Promise((resolve)=>{
        const time=moment().format(timeFormat);
        connection.query("UPDATE users SET last_checked=? WHERE users.id IN (?)",[time,ids],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function insertDistrict(row){
    return new Promise((resolve)=>{
        const time=moment().format(timeFormat);
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

function insertUser(email,districtId,vaccine,minAge){
    return new Promise((resolve)=>{
        const time=moment().format(timeFormat);

        console.log('Inserting user');
        connection.query("INSERT INTO users(email,district_id,vaccine_pref,min_age,created_at,updated_at) VALUES(?,?,?,?,?,?)",[email,districtId,vaccine,minAge,time,time],function(error,results,fields){
            if(error){
                throw error;
            }
            resolve();
        });
    });
}

function removeRequest(reqId){
    return new Promise((resolve)=>{
        connection.query("DELETE FROM users WHERE id=?",[reqId],function(err,results,fields){
            if(err) throw err;
            resolve();
        })
    })
}

async function connect(){
    return new Promise((resolve)=>{
        connection = mysql.createConnection({
            host: process.env.COWIN_DB_HOST,
            port: process.env.COWIN_DB_PORT,
            user: process.env.COWIN_DB_USERNAME,
            password: process.env.COWIN_DB_PASSWORD,
            database: process.env.COWIN_DB_DATABASE
        });
        connection.connect(resolve);
    });
}

function disconnect(){
    connection.end();
}

exports.db={
    getUsers,
    getUserEntries,
    getDistricts,
    updateUserNotified,
    updateUserChecked,
    insertDistrict,
    getDistrictId,
    insertUser,
    removeRequest,
    connect,
    disconnect
};