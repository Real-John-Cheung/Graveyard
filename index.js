import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"

async function judgeIfDead(url) {
    //let isOn = await isOnlineNow(url);
    //if (isOn) return false;
    let t = await timeTravel(url);
    if (typeof t !== 'object') return t;

    t.fingerPrint = createFingerPrint(url);
    return t;
}

console.log(await judgeIfDead("https://cnn.com"))