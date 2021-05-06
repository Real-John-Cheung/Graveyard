import natural from 'natural'
const wordTokenizer = new natural.WordTokenizer();
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

export function analyze(data) {
    let toReturn = {};
    //no. of images
    let noOfImg = typeof data === 'string' ? (data.match(/< *img/g) || []).length : 0;
    if (noOfImg > 0) toReturn.noOfImg = noOfImg;
    //languages
    let lang; // backup one for later
    if (typeof data === 'string') {
        let languages = data.match(/lang *= *(['"a-zA-Z\-])+/g);
        if (languages) {
            let langs = []
            languages.forEach(l => {
                let raw = l.replace(/lang *= */, "");
                raw = raw.replace(/['"]/g, "");
                raw = raw.trim();
                lang = raw;
                langs.push(LANGTABLE[raw] || raw);
            });
            toReturn.langs = langs;
        }
    }
    // no of Links
    let noOfLink = typeof data === 'string' ? (data.match(/< *a/g) || []).length : 0;
    if (noOfLink > 0) toReturn.noOfLink = noOfLink;
    // words count && sentiment check
    if (typeof data === 'string') {
        let arr = processHTML(data);
        toReturn.wordCount = arr.length;
        let useLang = lang ? lang.slice(0,2) : 'en'; //default = en
        if (sentimentAnalyzers[useLang] !== undefined) toReturn.sentiment = sentimentAnalyzers[useLang].getSentiment(arr);
    }

    return toReturn;
}

function processHTML(str) {
    let raws = str;
    raws = raws.replace(/<.*>/g, "");
    let raw = wordTokenizer.tokenize(raws);
    let cooked = [];
    raw.forEach(t => {
        if (/^<.*>$/.test(t.trim())) {
            //is tag
        } else if (/^[\p{P}|\+|-|<|>|\^|\$|\ufffd|`]*$/u.test(t.trim())) {
            // is punct
        } else if (/\n/.test(t.trim())) {
            // is \n
        } else {
            cooked.push(t.trim());
        }
    });
    return cooked;
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