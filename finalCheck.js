import { isOnlineNow, timeTravel } from "./util.js"
import { Minhash } from "minhash"
import { tweetNew } from "./twitterBot.js"
import { analyze } from "./analyzer.js"
import createFingerPrint from "./fingerPrint.js"


export async function finalCheck() {
    let tbcArr = await getTBC();
    for (let i = 0; i < tbcArr.length; i++) {
        const it = tbcArr[i];
        const timeCreated = it.createAt;
        const timeGap = Date.now() - Date.parse(timeCreated);
        if ((timeGap / 1000) / 3600 > 20) {
            // have been 20 hours
            await deleteTBC(it.objectId);
            let gra = await confirmIfDead(it.domain);
            if (gra && typeof gra === 'object') {
                //valid item
                let sup = await addGraveList(gra);
                let sut = await tweetNew(gra);
                if (sup && sut) return; // each time it was call, try to get one done
            }
        }
    }
}

export async function confirmIfDead(url, skipOnlineCheck) {
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

async function getTBC() {
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY
        },
        timeout: 20000
    }
    try {
        const resp = await axios.get(process.env.B4A_ENDPOINT + "TBC", config);
        if (resp !== undefined) {
            if (resp.status.toString() === "200") return resp.data;
            return undefined;
        }
        return undefined;
    } catch (e) {
        console.log('err: ' + e);
    }
}

async function deleteTBC(id) {
    const endp = process.env.B4A_ENDPOINT + "TBC/" + id;
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY,
            "X-Parse-Master-Key": process.env.B4A_MASTERKEY
        },
        timeout: 20000
    }
    try {
        const resp = await axios.delete(endp, config);
        if (resp.status.toString() === '200') return true;
        console.log("err in deleting tbc item: ", resp.headers);
        return;
    } catch (e) {
        console.log("err in deleting tbc item: ", e);
    }
    return
}

async function addGraveList(obj) {
    const endp = process.env.B4A_ENDPOINT + "graveList";
    const item = obj;
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY,
            "X-Parse-Master-Key": process.env.B4A_MASTERKEY,
            "Content-Type": "application/json"
        },
        timeout: 20000
    }
    try {
        const resp = await axios.post(endp, item, config);
        if (resp.status.toString() === '201') return true;
        console.log("err in adding graveList item: ", resp.headers);
        return;
    } catch (error) {
        console.log("err in adding graveList item: ", error);
    }
    return
}