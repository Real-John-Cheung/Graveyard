import natural from 'natural'
import LangDetect from 'langdetect'
import jsdom from 'jsdom'
import RiTa from 'rita'
import ChineseTokenizer from 'novel-segment'

const chTokenizer = new ChineseTokenizer();
chTokenizer.useDefault();//load dict
const { JSDOM } = jsdom;
const stemmer = natural.PorterStemmer;
const Analyzer = natural.SentimentAnalyzer;
const sentimentAnalyzers = {
    'eu': new Analyzer("Basque", null, 'senticon'),
    'ca': new Analyzer("Catalan", null, "senticon"),
    'nl': new Analyzer("Dutch", stemmer, 'pattern'),
    'en': new Analyzer("English", stemmer, "afinn"),
    'fr': new Analyzer("French", stemmer, 'pattern'),
    'gl': new Analyzer("Galician", null, 'senticon'),
    'it': new Analyzer("Italian", stemmer, 'pattern'),
    'es': new Analyzer("Spanish", stemmer, 'afinn')
}
const notKeywords = [
    "error","","not","在","再","的","地","得","不","他","他們","她","她們","它","它們","們","牠","牠們","我","我們","你","你們","妳","妳們","自","can","cannot","la","de","with","without"
];

export function analyze(data) {
    let toReturn = {};
    //no. of images
    let noOfImg = typeof data === 'string' ? (data.match(/< *img/g) || []).length : 0;
    
    // no of Links
    let noOfLink = typeof data === 'string' ? (data.match(/< *a/g) || []).length : 0;
    
    //languages
    let rawlangs = []; // backup one for later
    let fullLangs = []; // full names of the languages
    let wordsInHTML; //make a copy
    if (typeof data === 'string') {
        let languages = data.match(/lang *= *(['"a-zA-Z\-])+/g);
        if (languages) {
            let langs = []
            languages.forEach(l => {
                let raw = l.replace(/lang *= */, "");
                raw = raw.replace(/['"]/g, "");
                raw = raw.trim();
                rawlangs.push(raw.slice(0,2).toLowerCase());
                fullLangs.push(LANGTABLE[raw.slice(0,2).toLowerCase()] || raw.slice(0,2).toLowerCase());
            });
        }
        // use detectlanguage api
        wordsInHTML = processHTML(data);
        let words = wordsInHTML.join("");
        let mostLike = LangDetect.detect(words) && LangDetect.detect(words)[0].prob > 0.5 ? LangDetect.detect(words)[0] : undefined;
        if (mostLike !== undefined) {
            let iso2 = mostLike.lang.trim().toLowerCase().substring(0, 2);
            if (!rawlangs.includes(iso2)) rawlangs.push(iso2);
            if (!fullLangs.includes(iso2) && !fullLangs.includes(LANGTABLE[iso2])) fullLangs.push(LANGTABLE[iso2] || iso2);
        }
    }

    // words count && sentiment check
    let wordcount;
    let sentiment;
    if (typeof data === 'string') {
        if (wordsInHTML === undefined) wordsInHTML = processHTML(data);
        let arr = wordsInHTML;
        if (rawlangs.length > 0 && (getMostUsedLang(rawlangs).toLowerCase() === 'cn') || (getMostUsedLang(rawlangs).toLowerCase() === 'zh')) {
            //chinese tokenizer 
            let str = arr.join("");
            str = str.replace(/\s/g, "");
            wordsInHTML = chTokenizer.doSegment(str, { simple: true, stripPunctuation: true });
            wordcount = wordsInHTML.length;
        } else {
            //tokenize with RiTa
            wordcount = arr.length;
        }
        let useLang = rawlangs.length > 0 ? getMostUsedLang(rawlangs) : 'en'; //default = en
        if (sentimentAnalyzers[useLang] !== undefined) sentiment = sentimentAnalyzers[useLang].getSentiment(arr);
    }
    //keywords
    let keywords = [];
    if (wordsInHTML !== undefined) {
        let str = wordsInHTML.join(" ");
        let kwic = RiTa.concordance(str, {
            ignoreCase: true,
            ignoreStopWords: true,
            ignorePunctuation: true,
            wordsToIgnore: notKeywords
        })
        if (kwic && Object.keys(kwic).length > 0) {
            let sortable = [];
            for (let w in kwic) {
                sortable.push([w, kwic[w]]);
            }
            sortable.sort((a, b) => {
                if (a[1] !== b[1]) return b[1] - a[1]; // first sort by frq
                return b[0].length - a[0].length; // if same frq sort by word length
            });
            //console.log(sortable);
            let first5 = sortable.slice(0, Math.min(sortable.length, 8));
            keywords = first5;
        }
    }


    if (noOfImg > 0) toReturn.noOfImg = noOfImg;
    if (noOfLink > 0) toReturn.noOfLink = noOfLink;
    if (fullLangs.length > 0) toReturn.langs = fullLangs;
    if (wordcount !== undefined && wordcount > 0) toReturn.wordCount = wordcount;
    if (sentiment !== undefined) toReturn.sentiment = sentiment;
    if (keywords.length > 0) toReturn.keywords = keywords;
    return toReturn;
}

function processHTML(str) {
    let raws = str;
    let dom = new JSDOM(raws);
    let body = dom.window.document.body;
    let scripts = body.getElementsByTagName("script");
    let i = scripts.length;
    while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }
    let styles = body.getElementsByTagName("style");
    let ii = styles.length;
    while (ii--) {
        styles[ii].parentNode.removeChild(styles[ii]);
    }
    let text = body.textContent;
    text = text.replace(/\n/g, " ");
    return RiTa.tokenize(text);
}

function getMostUsedLang(arr) {
    if (!arr || arr.length === 0) return "";
    let o = {};
    arr.forEach(l => {
        let s = l.slice(0, 2);
        if (!o.hasOwnProperty(s)) {
            o[s] = 1;
        } else {
            o[s] += 1;
        }
    });
    let sortable = []
    for (let s in o) {
        sortable.push([s, o[s]]);
    }

    sortable.sort((a, b) => { return b[1] - a[1] });
    return sortable[0][0];
}

const LANGTABLE = {
ab: "Abkhazian",
aa: "Afar",
af: "Afrikaans",
ak: "Akan",
sq: "Albanian",
am: "Amharic",
ar: "Arabic",
an: "Aragonese",
hy: "Armenian",
as: "Assamese",
av: "Avaric",
ae: "Avestan",
ay: "Aymara",
az: "Azerbaijani",
bm: "Bambara",
ba: "Bashkir",
eu: "Basque",
be: "Belarusian",
bn: "Bengali (Bangla)",
bh: "Bihari",
bi: "Bislama",
bs: "Bosnian",
br: "Breton",
bg: "Bulgarian",
my: "Burmese",
ca: "Catalan",
ch: "Chamorro",
ce: "Chechen",
ny: "Chichewa, Chewa, Nyanja",
zh: "Chinese",
"zh-Hans": "Chinese (Simplified)",
"zh-Hant": "Chinese (Traditional)",
cv: "Chuvash",
kw: "Cornish",
co: "Corsican",
cr: "Cree",
hr: "Croatian",
cs: "Czech",
da: "Danish",
dv: "Divehi, Dhivehi, Maldivian",
nl: "Dutch",
dz: "Dzongkha",
en: "English",
eo: "Esperanto",
et: "Estonian",
ee: "Ewe",
fo: "Faroese",
fj: "Fijian",
fi: "Finnish",
fr: "French",
ff: "Fula, Fulah, Pulaar, Pular",
gl: "Galician",
gd: "Gaelic (Scottish)",
gv: "Gaelic (Manx)",
ka: "Georgian",
de: "German",
el: "Greek",
kl: "Greenlandic",
gn: "Guarani",
gu: "Gujarati",
ht: "Haitian Creole",
ha: "Hausa",
he: "Hebrew",
hz: "Herero",
hi: "Hindi",
ho: "Hiri Motu",
hu: "Hungarian",
is: "Icelandic",
io: "Ido",
ig: "Igbo",
id: "Indonesian",
in: "Indonesian",
ia: "Interlingua",
ie: "Interlingue",
iu: "Inuktitut",
ik: "Inupiak",
ga: "Irish",
it: "Italian",
ja: "Japanese",
jv: "Javanese",
kl: "Kalaallisut, Greenlandic",
kn: "Kannada",
kr: "Kanuri",
ks: "Kashmiri",
kk: "Kazakh",
km: "Khmer",
ki: "Kikuyu",
rw: "Kinyarwanda (Rwanda)",
rn: "Kirundi",
ky: "Kyrgyz",
kv: "Komi",
kg: "Kongo",
ko: "Korean",
ku: "Kurdish",
kj: "Kwanyama",
lo: "Lao",
la: "Latin",
lv: "Latvian (Lettish)",
li: "Limburgish ( Limburger)",
ln: "Lingala",
lt: "Lithuanian",
lu: "Luga-Katanga",
lg: "Luganda, Ganda",
lb: "Luxembourgish",
gv: "Manx",
mk: "Macedonian",
mg: "Malagasy",
ms: "Malay",
ml: "Malayalam",
mt: "Maltese",
mi: "Maori",
mr: "Marathi",
mh: "Marshallese",
mo: "Moldavian",
mn: "Mongolian",
na: "Nauru",
nv: "Navajo",
ng: "Ndonga",
nd: "Northern Ndebele",
ne: "Nepali",
no: "Norwegian",
nb: "Norwegian bokmål",
nn: "Norwegian nynorsk",
ii: "Nuosu",
oc: "Occitan",
oj: "Ojibwe",
cu: "Old Church Slavonic, Old Bulgarian",
or: "Oriya",
om: "Oromo (Afaan Oromo)",
os: "Ossetian",
pi: "Pāli",
ps: "Pashto, Pushto",
fa: "Persian (Farsi)",
pl: "Polish",
pt: "Portuguese",
pa: "Punjabi (Eastern)",
qu: "Quechua",
rm: "Romansh",
ro: "Romanian",
ru: "Russian",
se: "Sami",
sm: "Samoan",
sg: "Sango",
sa: "Sanskrit",
sr: "Serbian",
sh: "Serbo-Croatian",
st: "Sesotho",
tn: "Setswana",
sn: "Shona",
ii: "Sichuan Yi",
sd: "Sindhi",
si: "Sinhalese",
ss: "Siswati",
sk: "Slovak",
sl: "Slovenian",
so: "Somali",
nr: "Southern Ndebele",
es: "Spanish",
su: "Sundanese",
sw: "Swahili (Kiswahili)",
ss: "Swati",
sv: "Swedish",
tl: "Tagalog",
ty: "Tahitian",
tg: "Tajik",
ta: "Tamil",
tt: "Tatar",
te: "Telugu",
th: "Thai",
bo: "Tibetan",
ti: "Tigrinya",
to: "Tonga",
ts: "Tsonga",
tr: "Turkish",
tk: "Turkmen",
tw: "Twi",
ug: "Uyghur",
uk: "Ukrainian",
ur: "Urdu",
uz: "Uzbek",
ve: "Venda",
vi: "Vietnamese",
vo: "Volapük",
wa: "Wallon",
cy: "Welsh",
wo: "Wolof",
fy: "Western Frisian",
xh: "Xhosa",
yi: "Yiddish",
ji: "Yiddish",
yo: "Yoruba",
za: "Zhuang, Chuang",
zu: "Zulu",
}