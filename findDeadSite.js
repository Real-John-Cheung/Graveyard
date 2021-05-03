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
        return !/^[45]/.test(sta);
    });
    return b
}

