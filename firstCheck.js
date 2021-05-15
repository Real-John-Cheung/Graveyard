import { isOnlineNow, timeTravel } from './util.js'
import axios from 'axios'
if (process.env.B4A_APPID === undefined || process.env.B4A_RESTAPIKEY === undefined || process.env.B4A_ENDPOINT) {
    let m = await import('./env.js');
    process.env.B4A_APPID = m.B4A_CONFIG.appid;
    process.env.B4A_RESTAPIKEY = m.B4A_CONFIG.restapikey;
    process.env.B4A_ENDPOINT = m.B4A_CONFIG.endpoint;
}

export async function findDeath() {
    const limit = 20;
    let rawArr = await getRaw();
    if (rawArr === undefined) return undefined;
    let count = 0;
    while (rawArr.length > 0) {
        let f = rawArr.shift();
        let d = f.domain;
        const isDead = await firstCheck(d);
        if (isDead) {
            const re = await addTBC(d);
            if (re) count++;
        }
        await deleteRaw(f.objectId);
        if (count > limit) return; // limit request # 
    }
}

export async function firstCheck(url) {
    url = "http://" + url;
    let isOn = skipOnlineCheck ? false : await isOnlineNow(url);
    if (isOn) return false;
    let t = await timeTravel(url, 1, true);
    if (typeof t !== 'object') return t;
    return true;
}

async function getRaw() {
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY
        }
    }
    try {
        const resp = await axios.get(process.env.B4A_ENDPOINT + "Raw", config);
        if (resp !== undefined) {
            if (resp.status.toString() === "200") return resp.data;
            return undefined;
        }
        return undefined;
    } catch (e) {
        console.log('err: ' + e);
    }
}

async function deleteRaw(id) {
    const endp = process.env.B4A_ENDPOINT + "Raw/" + id;
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY
        }
    }
    try {
        const resp = await axios.delete(endp, config);
        if (resp.status.toString() === '200') return true;
        console.log("err in deleting raw item: ", resp);
        return;
    } catch (e) {
        console.log("err in deleting raw item: ", e);
    }
    return
}

async function addTBC(domain) {
    const endp = process.env.B4A_ENDPOINT + "TBC";
    const item = { domain: domain };
    const config = {
        headers: {
            "X-Parse-Application-Id": process.env.B4A_APPID,
            "X-Parse-REST-API-Key": process.env.B4A_RESTAPIKEY,
            "Content-Type": "application/json"
        }
    }
    try {
        const resp = await axios.post(endp, item, config);
        if (resp.status.toString() === '200') return true;
        console.log("err in adding tbc item: ", resp);
        return;
    } catch (error) {
        console.log("err in adding tbc item: ", error);
    }
    return
}
