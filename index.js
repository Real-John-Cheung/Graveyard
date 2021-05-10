import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"
import { analyze } from "./analyzer.js"
import pg from 'pg'
const { Client } = pg;

if (process.env.DATABASE_URL === undefined) {
    let m = await import('./env.js');
    process.env.DATABASE_URL = m.DATABASE_URL;
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

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
    let t = await timeTravel(url);
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
    return {first: o.first.statics, last: o.last.statics};
}

async function createTestJSON() {
    let a = [];
    let o = await confirmIfDead("kilopeople.com");
    a.push(o);
    let o2 = await confirmIfDead("chuganwang.com");
    a.push(o2);
    let o3 = await confirmIfDead("carlightstore.com");
    a.push(o3);
    import('fs').then(fs => {
        fs.writeFileSync('./test.json', JSON.stringify(a));
    });

}

console.log(process.env.DATABASE_URL);