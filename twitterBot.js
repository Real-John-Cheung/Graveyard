import Twitter from 'twitter-lite'

if (process.env.CONSUMER_KEY === undefined || process.env.CONSUMER_SECRET === undefined
|| process.env.ACCESS_TOKEN_KEY === undefined || process.env.ACESS_TOKEN_SECRET === undefined) {
    let m = await import('./env.js');
    process.env.CONSUMER_KEY = m.TWITTER_CONFIG.CONSUMER_KEY;
    process.env.CONSUMER_SECRET = m.TWITTER_CONFIG.CONSUMER_SECRET;
    process.env.ACCESS_TOKEN_KEY = m.TWITTER_CONFIG.ACCESS_TOKEN_KEY;
    process.env.ACESS_TOKEN_SECRET = m.TWITTER_CONFIG.ACCESS_TOKEN_SECRET;
}

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY, 
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACESS_TOKEN_SECRET
}); // using v1.1 api

export async function tweetNew(obj, media) {
    if (!obj || typeof obj !== 'object') return;
    let msg = processObj(obj);
    let opts = {};
    opts.status = msg;
    if (media) {
        //? add media_ids to opts
    }
    const tweet = await client.post("statuses/update", opts).then((resp) => {
        if (resp.id) {
            console.log("Success, tweet id: " + resp.id_str);
            return true
        }
        console.log("Fail to tweet, resp: ", resp);
        return false;
    }, (e) => {
        console.log("Fail to tweet, err: ", e);
    });
    return tweet ? true : false;
}

function processObj(o) {
    let toReturn = "";
    const getD = function (d, isLast) {
        let dstr = d.split("T")[0];
        if (isLast) dstr = (new Date(dstr.split("-")[0], parseInt(dstr.split("-")[1]) - 1, parseInt(dstr.split("-")[2]) + 2)).toISOString().split("T")[0];
        const a = dstr.split("-");
        let s = a[0];
        let m = monthTable[a[1]];
        s = m + " " + s;
        s = a[2].replace(/^0([0-9])$/, "$1") + " " + s;
        return s;
    }
    toReturn += o.domain + "\n";
    toReturn += "Born on " + getD(o.first.date, 0) + " - " + "Died on " + getD(o.last.date, 1) + "\n";
    toReturn += "R.I.P in Internet Graveyard \n\n",
    toReturn += "Visit its grave and know more about it at https://real-john-cheung.github.io/Internet-Graveyard"
    return toReturn;
}

const monthTable = {
    "01": "Jan.",
    "02": "Feb.",
    "03": "Mar.",
    "04": "Apr.",
    "05": "May",
    "06": "Jun.",
    "07": "Jul.",
    "08": "Aug.",
    "09": "Sep.",
    "10": "Oct.",
    "11": "Nov.",
    "12": "Dec."
}
