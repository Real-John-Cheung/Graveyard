import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"
import { countImgTag } from "./analyzer.js"

async function judgeIfDead(url) {
    let isOn = await isOnlineNow(url);
    //if (isOn) return false;
    let t = await timeTravel(url);
    if (typeof t !== 'object') return t;

    t.fingerPrint = createFingerPrint(url);
    let d = new Date()
    t.time = d.toUTCString();
    t.domain = url.trim().replace(/http[s]?:\/\//, "").replace(/\/,*$/, "");
    t.first.statics = {
        noOfImg: countImgTag(t.first.data)
    };
    t.last.statics = {
        noOfImg: countImgTag(t.last.data)
    };
    return t;
}

async function test() {
    let o = await judgeIfDead("https://fake.com");
    return {first: o.first.statics, last: o.last.statics};
}

console.log(await test());