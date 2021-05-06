import fs from 'fs';
import axios from "axios";

const get = async function(url) {
    try {
        const resp = await axios.get(url);
        return resp;
    } catch(err) {
        console.error(err);
        return undefined;
    }
}

export async function isOnlineNow(url, debug) {
    let b = await get(url).then(resp => {
        if (resp === undefined) {
            console.error("Undefined response");
            return undefined;
        }
        let sta = resp.status.toString();
        if (debug) console.log("Status code for " + url + " is " + sta);
        return !/^[45][0-9][0-9]$/.test(sta);
    });
    return b
}

export async function timeTravel(url, debug) {
    let uri = url;
    let s = "http://labs.mementoweb.org/timemap/json/" + uri;
    let timemap = await get(s).then(resp => {
        if (resp === undefined) {
            console.error("Undefined response");
            return undefined;
        } else if (!/^[2][0-9][0-9]$/.test(resp.status.toString())) {
            if (debug) console.log("No history found");
            return false;
        } else {
            let raw = resp.data;
            return raw.timemap_index;
        }
    });
    if (timemap === undefined) return undefined;
    if (timemap === false) return false;
    if (!Array.isArray(timemap)) {
        if (debug) console.error("Unknown Error");
        return undefined;
    }
    let first_uri = timemap[0].uri;
    let last_uri = timemap[timemap.length - 1].uri;
    let first_snap = await get(first_uri).then(r => {
        if (r === undefined) {
            console.error("Undefined response in uri");
            return undefined;
        } else if (!/^[2][0-9][0-9]$/.test(r.status.toString())) {
            if (debug) console.log("Invaild entries in history");
            return false;
        } else {
            let li = r.data.mementos.list;
            let da = li[0].datetime;
            let u = li[0].uri;
            return { date: da, uri: u }
        }
    });
    let latest_snap = await get(last_uri).then(r => {
        if (r === undefined) {
            console.error("Undefined response in uri");
            return undefined;
        } else if (!/^[2][0-9][0-9]$/.test(r.status.toString())) {
            if (debug) console.log("Invaild entries in history");
            return false;
        } else {
            let li = r.data.mementos.list;
            let da = li[li.length - 1].datetime;
            let u = li[li.length - 1].uri;
            return { date: da, uri: u }
        }
    });
    let toReturn = { first: first_snap, last: latest_snap };
    let snapData = await getHTML(toReturn);
    toReturn.first.data = snapData.firstData;
    toReturn.last.data = snapData.lastData;
    return toReturn
}

export async function getHTML(obj) {
    let fURI = obj.first.uri;
    let lURI = obj.last.uri;
    let resf = await get(fURI).then(resp => {
        if (!/^2[0-9][0-9]$/.test(resp.status.toString())) return { error: "request fail with code " + resp.status };

        return resp.data;
    });
    let resl = await  get(lURI).then(resp => {
        if (!/^2[0-9][0-9]$/.test(resp.status.toString())) return { error: "request fail with code " + resp.status };

        return resp.data;
    });
    return {firstData: resf, lastData:resl};
}