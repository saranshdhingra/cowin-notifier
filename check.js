const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment-timezone');
const {db} = require('./db');
const {mailer} = require('./mail');

moment.tz.setDefault('UTC');

const pollTimeout = 20; // repeat the process every X seconds

/**
 * Gets the list of users we need to query for
 */
async function getUsers(){
    let users = await db.getUsers();
    return users;
}

/**
 * Loop function
 */
async function start(){
    let users = await getUsers();

    checkForUsers(users).then(()=>{
        console.log('checked for all users now, polling...');
        setTimeout(()=>{
            start();
        },pollTimeout * 1000);
    });
}

/**
 * Function takes in a list of users and checks the availabilities for all those users.
 * @param {array} list of users 
 * @returns Promise
 */
async function checkForUsers(users){
    const today = moment().format('DD-MM-YYYY'),
    tomorrow = moment().add(1,'d').format('DD-MM-YYYY');
    return new Promise((resolve)=>{
        let promises=[];
        users.forEach((user)=>{
            promises.push(checkForDate(user,today));
            // promises.push(checkForDate(user,tomorrow));
        });
    
        Promise.all(promises).then(resolve);
    });
}

/**
 * Checks the availability of a user for a particular date
 * @param {object} user 
 * @param {string} date 
 * @returns 
 */
async function checkForDate(user,date){
    let districtId = user.district_id, minAge=user.min_age, vaccine=user.vaccine_pref;

    return new Promise(async (resolve)=>{
        console.log(`Checking for ${vaccine}(user:${user.id}) in age limit: ${minAge} for date:${date} and district id:${districtId}`);

        let data = await getData(districtId,date),
            centers = data.centers,
            foundSessions = [];

        centers.forEach((center)=>{
            center.sessions.forEach((session)=>{
                if(isSessionValid(session,user)){
                    let displayStr=`|--Center: ${center.name}\n|--Address: ${center.address}\n|--Available:${session.available_capacity}\n|--ID:${session.session_id}\n|--PIN:${center.pincode}\n|--Date: ${session.date}`;
                    foundSessions.push(displayStr);
                }
            });
        });

        if(foundSessions.length && shouldNotify(user)){
            console.log(foundSessions.join('\n'));
            await mailer.sendMail(user.email,foundSessions);
            await db.updateUserNotified(user);
        }

        resolve();
    });
}

/**
 * Core func that calls the Cowin API to get the data
 * @param {integer} districtId 
 * @param {string} date 
 * @returns 
 */
function getData(districtId,date){
    const headers={
        'accept':'application/json',
        'origin':'https://www.cowin.gov.in',
        'referer':'https://www.cowin.gov.in/',
        'user-agent':'Mozilla/5.0 (X11; CrOS x86_64 13729.84.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.130 Safari/537.36'
    };
    return new Promise((resolve,reject)=>{
        // resolve(getStaticData());
        // return;
        let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`;
        fetch(url,{headers})
        .then(response => response.json())
        .then(data => resolve(data));
    });
}

function isSessionValid(session,user){
    return (
        session.vaccine.toLowerCase() === user.vaccine_pref && 
        session.min_age_limit <= user.min_age && 
        session.available_capacity > 0
    );
}

function shouldNotify(user){
    return (
        user.last_notified===null || 
        moment().diff(moment(user.last_notified),'seconds') > process.env.MIN_NOTIFY_DELAY_SECS
    );
}

/**
 * Test func that checks our functionality with some false positives
 * @returns object
 */
function getStaticData(){
    return JSON.parse(fs.readFileSync('sample.json','utf-8'));
}

db.connect();
start();