import Twitter from 'twitter-lite'

if (process.env.TWITTERKEY === undefined || process.env.TWITTERTOKEN === undefined) {
    let m = await import('./env.js');
    process.env.TWITTERKEY = m.TWITTERKEY;
    process.env.TWITTERTOKEN = m.TWITTERTOKEN;
}

const client = new Twitter({
    version: "2", 
    extension: false, 
    consumer_key: process.env.TWITTERKEY, 
    consumer_secret: process.env.TWITTERTOKEN 
});