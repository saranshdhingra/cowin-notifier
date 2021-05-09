const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});


async function getUsers() {
    return new Promise((resolve) => {

        connection.query('SELECT * FROM users', function (error, results, fields) {
            if (error) throw error;
            resolve(results);
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
    connect,
    disconnect
};