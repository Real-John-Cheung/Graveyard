import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"
import { analyze } from "./analyzer.js"
import { tweetNew } from "./twitterBot.js"
import axios from 'axios'
import { Minhash } from "minhash"

// if (process.env.B4A_APPID === undefined || process.env.B4A_RESTAPIKEY === undefined) {
//     let m = await import('./env.js');
//     if (process.env.B4A_APPID === undefined) process.env.B4A_APPID = m.B4A_CONFIG.appid;
//     if (process.env.B4A_RESTAPIKEY === undefined) process.env.B4A_RESTAPIKEY = m.B4A_CONFIG.restapikey;
// }

// async function getRaw() {
//     const config = {
//         headers: {
//             "X-Parse-Application-Id": process.env.B4A_APPID,
//             "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY
//         }
//     }
//     try {
//         const resp = await axios.get('', config);
//         if (resp !== undefined) {
//             if (resp.status.toString() === "200") return resp.data;
//             return undefined;
//         }
//         return undefined;
//     } catch (e) {
//         console.log('err: ' + e);
//     }
// }

async function findDeath(url) {
    url = "http://" + url;
    let isOn = skipOnlineCheck ? false : await isOnlineNow(url);
    if (isOn) return false;
    let t = await timeTravel(url, 1, true);
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
    if (t.first.statics && t.last.statics && t.first.statics.words && t.last.statics.words) {
        let f = t.first.statics.words;
        let l = t.last.statics.words;
        if (!f || !l || f.length === 0 || l.length === 0) {
        }else {
            let mf = new Minhash();
            let ml = new Minhash();
            f.forEach(w => mf.update(w));
            l.forEach(w => ml.update(w));
            if (mf.jaccard(ml) !== undefined) t.similarity = mf.jaccard(ml);
        }

    }

    //delete data field to save db place
    delete t.first.data
    delete t.last.data
    delete t.first.statics.words
    delete t.last.statics.words

    return t;
}

async function createTestJSON(raw) {
    let dl = [,"chuganwang.com","carlightstore.com","tnsvoronezh.ru", "fcspam.ru", "YourGameGuy.com", "CanadaGoose-Jackets.org.uk","MichaelKorsOnline.ca",
    "nao-stroy.ru",
    "StampProject.it",
    "usacheapnfljerseysbiz.com",
    "yazdhistory.com",
    "CanadaGooseOutletStore.ca",
        "wsland.cn",
        "Brenda-RossRealty.org",
        "AllJordan.xyz",
        "Teach-Sports.com",
        "Black-Tip.top",
        "druskabydaisy.com",
        "JazzWorld.ch",
        "Milk.xyz",
        "ra3e.com"]
    let a = [];
    for (let i = 0; i < dl.length; i ++) {
        let o = await confirmIfDead(dl[i], 1);
        if (o) a.push(o);
    }
   
    import('fs').then(fs => {
        fs.writeFileSync('./test.json', JSON.stringify(a));
    });

}

createTestJSON();