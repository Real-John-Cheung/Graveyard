import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"
import { analyze } from "./analyzer.js"
import axios from 'axios'
// import pg from 'pg'
// const { Client } = pg;

// if (process.env.DATABASE_URL === undefined) {
//     let m = await import('./env.js');
//     process.env.DATABASE_URL = m.DATABASE_URL; // remote
// }

// // const client = new Client({
// //     connectionString: process.env.DATABASE_URL,
// //     ssl: {
// //         rejectUnauthorized: false
// //     }
// // }); //remote

// const client = new Client(); // local

// async function textDB() {
//     const testTable = `
//     //CREATE EXTENSION IF NOT EXISTS "pgcrypto";
//     CREATE TABLE IF NOT EXISTS toBeConfirm (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     data JSONB
//     );
//     `

//     await client.connect();

//     //await client.query(testTable);

//     const newItem = { 'chuganwang.com': '20210501' }
//     //await client.query('INSERT INTO ToBeConfirm(data) VALUES($1)', [newItem]);

//     const { rows } = await client.query('SELECT * FROM toBeConfirm')

//     console.log(rows[0], typeof rows[0]);

//     await client.end();
// }


if (process.env.B4A_APPID === undefined || process.env.B4A_RESTAPIKEY === undefined) {
    let m = await import('./env.js');
    if (process.env.B4A_APPID === undefined) process.env.B4A_APPID = m.B4A_CONFIG.appid;
    if (process.env.B4A_RESTAPIKEY === undefined) process.env.B4A_RESTAPIKEY = m.B4A_CONFIG.restapikey;
}

async function getRaw() {
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY
        }
    }
    try {
        const resp = await axios.get('https://internetgraveyard.b4a.io/classes/raw', config);
        if (resp !== undefined) {
            if (resp.status.toString() === "200") return resp.data;
            return undefined;
        }
        return undefined;
    } catch (e) {
        console.log('err: ' + e);
    }
}

async function findDeath(url) {
    url = "http://" + url;
    let isOn = skipOnlineCheck ? false : await isOnlineNow(url);
    if (isOn) return false;
    let t = await timeTravel(url);
    if (typeof t !== 'object') return t;
    return true;
}

async function confirmIfDead(url, skipOnlineCheck) {
    url = "http://" + url;
    let isOn = skipOnlineCheck ? false : await isOnlineNow(url);
    if (isOn) return false;
    let t = await timeTravel(url, 1);
    if (typeof t !== 'object') return t;
    let seed = t.first.data + t.last.data;

    t.fingerPrint = createFingerPrint(seed);
    let d = new Date()
    t.time = d.toUTCString();
    t.domain = url.trim().replace(/http[s]?:\/\//, "").replace(/\/,*$/, "");
    t.first.statics = analyze(t.first.data);
    t.last.statics = analyze(t.last.data);

    //delete data field to save db place
    delete t.first.data
    delete t.last.data

    return t;
}

async function test() {
    let o = await confirmIfDead("https://fake.com");
    return { first: o.first.statics, last: o.last.statics };
}

async function createTestJSON(raw) {
    let a = [];
    let o = await confirmIfDead("kilopeople.com");
    if (o) a.push(o);
    let o2 = await confirmIfDead("chuganwang.com", 1);
    if (o2) a.push(o2);
    let o3 = await confirmIfDead("carlightstore.com");
    if (o3) a.push(o3);
    import('fs').then(fs => {
        fs.writeFileSync('./test.json', JSON.stringify(a));
    });

}

createTestJSON();
