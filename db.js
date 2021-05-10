const mysql = require('mysql');
const moment = require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('UTC');

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

function connect(){
    connection.connect();
}

function disconnect(){
    connection.end();
}

exports.db={
    getUsers,
    updateUserNotified,
    connect,
    disconnect
};