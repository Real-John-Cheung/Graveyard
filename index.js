import createFingerPrint from "./fingerPrint.js"
import { isOnlineNow, timeTravel } from "./findDeadSite.js"
import { analyze } from "./analyzer.js"

async function judgeIfDead(url, skipOnlineCheck) {
    let isOn = skipOnlineCheck ? false : await isOnlineNow(url);
    if (isOn) return false;
    let t = await timeTravel(url);
    if (typeof t !== 'object') return t;

    t.fingerPrint = createFingerPrint(url);
    let d = new Date()
    t.time = d.toUTCString();
    t.domain = url.trim().replace(/http[s]?:\/\//, "").replace(/\/,*$/, "");
    t.first.statics = analyze(t.first.data);
    t.last.statics = analyze(t.last.data);
    return t;
}

async function test() {
    let o = await judgeIfDead("https://fake.com");
    return {first: o.first.statics, last: o.last.statics};
}

async function createTestJSON() {
    let o = await judgeIfDead("https://fake.com", true);
    
    import('fs').then(fs => {
        fs.writeFileSync('./test.json', JSON.stringify(o));
    });

}

createTestJSON();