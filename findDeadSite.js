import axios from "axios"
import iconv from "iconv-lite"
const DOMAINSELLER = ['epik', 'bluehost', 'godaddy', 'network solution', "hostgator", 'namecheap', 'dreamhost', 'buydomains', "biix"];


const isForSale = function (title, domain) {
    let contentThisDomain = title.includes(domain);
    let contentWordDomain = title.includes("domain");
    let contentWordForsale = title.includes("for") && title.includes("sale");
    let contentWordBuyWith = title.includes("buy") && title.includes("with");
    let contentWordBuyFrom = title.includes("buy") && title.includes("from");

    let contentSeller = false;
    for (let i = 0; i < DOMAINSELLER.length; i++) {
        let s = DOMAINSELLER[i];
        if (title.includes(s)) {
            contentSeller = true;
            break;
        }
    }

    return ((contentThisDomain || contentWordDomain) && contentWordForsale) || ((contentWordBuyFrom || contentWordBuyWith) && contentSeller);
}

const get = async function(url) {
    try {
        const resp = await axios.get(url);
        return resp;
    } catch(err) {
        return undefined;
    }
}

export async function isOnlineNow(url, debug) {
    let b = await get(url).then(resp => {
        if (resp === undefined) {
            console.error(url + " isOnline?: Undefined response");
            return false;
        }
        let sta = resp.status.toString();
        if (debug) console.log("Status code for " + url + " is " + sta);
        if (/^[45][0-9][0-9]$/.test(sta)) return false;
        // get rid of for sale pages
        let data = resp.data;
        let title = data.match(/<title[^>]*>([^<]+)<\/title>/)[0];
        title = title.replace(/<[\/]?title>/g, "");
        return !isForSale(title.toLowerCase(), url.replace(/http[s]?:\/\//, "").toLowerCase());
    });
    return b
}

export async function timeTravel(url, debug, short) {
    let uri = url;
    let s = "http://labs.mementoweb.org/timemap/json/" + uri;
    let timemap = await get(s).then(resp => {
        if (resp === undefined) {
            console.error("timetravel: Undefined response");
            return undefined;
        } else if (!/^[2][0-9][0-9]$/.test(resp.status.toString())) {
            if (debug) console.log("No history found for " + url);
            return false;
        } else {
            let raw = resp.data;
            return raw;
        }
    });
    if (timemap === undefined || timemap === false) return false
    if (short) return true;
    /// continute process WDI
    if (timemap.hasOwnProperty("timemap_index")) {
        if (!Array.isArray(timemap.timemap_index)) {
            if (debug) console.error("Unknown Error");
            return undefined;
        }
        let list = timemap.timemap_index;
        let first_uri = list[0].uri;
        let last_uri = list[list.length - 1].uri;
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
        return toReturn;
    } else if (timemap.hasOwnProperty("mementos")) {
        // handle other kinds
        let list = timemap.mementos.list;
        let first_snap = { date: list[0].datetime, uri: list[0].uri };
        let latest_snap = { date: list[list.length - 1].datetime, uri: list[list.length - 1].uri };
        let toReturn = { first: first_snap, last: latest_snap };
        let snapData = await getHTML(toReturn);
        toReturn.first.data = snapData.firstData;
        toReturn.last.data = snapData.lastData;
        return toReturn;
    }
}

export async function getHTML(obj) {
    let fURI = obj.first.uri;
    let lURI = obj.last.uri;
    let resf = await axios.get(fURI, {responseType: 'arraybuffer' }).then(resp => {
        if (!/^2[0-9][0-9]$/.test(resp.status.toString())) return { error: "request fail with code " + resp.status };
        let charset = resp.headers['content-type'].match(/charset *= *[a-zA-Z0-9/-]+/)[0].replace(/charset *= *([a-zA-Z0-9/-]+)/, "$1").trim();
        let data = iconv.decode(resp.data, charset.toLowerCase());
        return data;
    }, err => {
        console.log("err when trying to fetch" + fURI + err);
    });
    let resl = await axios.get(lURI, {responseType: 'arraybuffer' }).then(resp => {
        if (!/^2[0-9][0-9]$/.test(resp.status.toString())) return { error: "request fail with code " + resp.status };
        let charset = resp.headers['content-type'].match(/charset *= *[a-zA-Z0-9/-]+/)[0].replace(/charset *= *([a-zA-Z0-9/-]+)/, "$1").trim();
        let data = iconv.decode(resp.data, charset.toLowerCase());
        return data;
    }, err => {
        console.log("err when trying to fetch" + lURI + err);
    });
    return {firstData: resf, lastData:resl};
}