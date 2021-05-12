Parse.initialize('D3v9Sxvy5Ac8RJeMk63QfRt7AaXbNjy7aLFvsIru', 'oqz1Iw3sOFZLlFEqLkg6mNB3WL1K3PvG818TWIYx')
Parse.serverURL = 'https://parseapi.back4app.com/'

const monthTable = {
    "01": "JAN",
    "02": "FEB",
    "03": "MAR",
    "04": "APR",
    "05": "MAY",
    "06": "JUN",
    "07": "JUL",
    "08": "AUG",
    "09": "SEP",
    "10": "OCT",
    "11": "NOV",
    "12": "DEC"
}

function displayAgreement() {
    document.getElementById("agreement").style.display = "block";
    document.getElementById("shadow").style.display = "block";
}

function hideAgreement() {
    document.getElementById("agreement").style.display = "none";
    document.getElementById("shadow").style.display = "none";
}

function showGravestoneDetail(id) {
    document.getElementById(id).style.display = "block";
    document.getElementById("shadow").style.display = "block";
}

function hideGravestoneDetail(ids) {
    document.getElementById(ids).style.display = "none";
    document.getElementById("shadow").style.display = "none";
}

// generate the website
$(document).ready(() => {
    document.fonts.load("12pt 'Benny Harvey RIP'").then(() => {
        //document.fonts.ready.then(getJson("./test.json"));// local
        document.fonts.ready.then(fetchJSON("test")); // from database
    });
});

function fetchJSON(cla) {
    const c = Parse.Object.extend(cla);
    const q = new Parse.Query(c);
    q.find().then((res) => {
        let objs = [];
        res.forEach(o => {
            let no = {};
            no.domain = o.get("domain");
            no.fingerPrint = o.get("fingerPrint");
            no.time = o.get("time");
            no.first = o.get("first");
            no.last = o.get("last");
            objs.push(no);
        });
        createGraveyard(objs, 1);
    }, (err) => {
        console.error("Error when fetch data " + err);
        handleLoadError();
    });
}

function getJson(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.onload = () => {
        const resp = request.response;
        if (/^2[0-9][0-9]$/.test(request.status.toString())) {
            createGraveyard(resp, 1);
        } else {
            handleLoadError()
        }
    };
    request.onerror = () => {
        console.error("Error occurs when try to fetch data");
        handleLoadError();
    }
    request.send();
}

function createGraveyard(objs, debug) {
    if (debug) console.log("create graveyard according to following data", objs);
    if (debug) console.log(document.fonts)
    objs.forEach((obj, i) => {
        //create each gravestone
        //infos
        let id = i;
        let idds = "gsd" + i;
        let name = obj.domain;
        let firstDate = obj.first.date.split("T")[0];
        let firstDateY = obj.first.date.split("-")[0];;
        let rawD = obj.last.date.split("T")[0];
        let lastDate = (new Date(rawD.split("-")[0], parseInt(rawD.split("-")[1]) - 1, parseInt(rawD.split("-")[2]) + 2)).toISOString().split("T")[0];
        let lastDateY = lastDate.split("-")[0];
        //create elements
        let a = document.createElement("a");
        a.href = "javascript:void(0)"
        a.setAttribute("onclick", `showGravestoneDetail("${idds}")`);
        a.setAttribute("class", "gravestone");
        let canvas = document.createElement("canvas");
        canvas.setAttribute("class", "canvas")
        canvas.width = 160;
        canvas.height = 160;
        //draw
        let ctx = canvas.getContext('2d');
        ctx.font = 'Benny Harvey RIP';

        //bg ?
        //let img = $("#gsbg")[0];
        //ctx.drawImage(img, 0, 0, canvas.width, canvas.height);//ugly :(
        
        //icon 
        //TODOS
        let iconInfo = genIcon(obj.fingerPrint);

        //texts
        ctx.textAlign = 'center';
        ctx.font = '12pt "Benny Harvey RIP"'
        ctx.fillStyle = "white";
        ctx.fillText(name, canvas.width / 2, canvas.height * 0.7, 140);
        ctx.font = "14pt 'Benny Harvey RIP'";
        ctx.fillText(firstDateY + "  ~  " + lastDateY, canvas.width/2, canvas.height*0.85);
        // -- 
        a.appendChild(canvas);
        $("#main").append(a);

        //append graveStone detail
        let d = document.createElement("div");
        d.setAttribute("class", "gravestoneDetail");
        d.id = idds;
        //append children of detail
        //exit button
        let exitButtonwrapper = document.createElement("p");
        exitButtonwrapper.setAttribute("style", "text-align: right;padding-right: 20px;height:8%");
        let exitButton = document.createElement("a");
        exitButton.href = "javascript:void(0)"
        exitButton.setAttribute("onclick", `hideGravestoneDetail("${idds}")`);
        let exitButtonImg = document.createElement("img");
        exitButtonImg.src = "./res/closeButton.png";
        exitButtonImg.width = "20";
        exitButtonImg.height = "20";
        exitButtonwrapper.appendChild(exitButton)
        exitButton.appendChild(exitButtonImg);
        d.appendChild(exitButtonwrapper);
        //create content wrapper
        let dc = document.createElement("div");
        dc.setAttribute("class", "gravestoneDetailContent");
        //icon & domain
        let icondomainwrapper = document.createElement("div");
        icondomainwrapper.setAttribute("class", "icondomainWrapper");
        //icon
        //TODOS
        //domain
        let domain = document.createElement("p");
        domain.setAttribute("class", "detailDomain");
        domain.innerHTML = "<b>" + name + "</b>";
        //lang
        let siteLang = getLang(obj);
        if (siteLang !== undefined) {
            domain.innerHTML += "<br><span style=\"font-size: small;\">Major Language: "+siteLang+"</span><br>"
        }
        icondomainwrapper.appendChild(domain);
        dc.appendChild(icondomainwrapper);
        //fingerPrint
        let fingerprint = document.createElement("p");
        fingerprint.setAttribute("class", "detailFingerPrint");
        fingerprint.innerHTML = "FingerPrint: <br>" + obj.fingerPrint;
        dc.appendChild(fingerprint);
        //date of birth
        let dob = document.createElement("p");
        dob.setAttribute("class", "detailDob");
        dob.innerHTML = "<a href=\""+ obj.first.uri +"\" target=\"_blank\">" + processDate(firstDate) + "</a> <b> Logged in</b>";
        dc.appendChild(dob);
        let bsta = document.createElement("p");
        bsta.setAttribute("class", "statics");
        let bstas = "";
        let bstatics = obj.first.statics;
        bstas += staticsToInnerHTML(bstatics) || "";
        if (bstas.length > 0) {
            bsta.innerHTML = bstas;
            dc.appendChild(bsta);
        }
        //date of death
        let dod = document.createElement("p");
        dod.setAttribute("class", "detailDod");
        dod.innerHTML = "<a href=\""+ obj.last.uri +"\" target=\"_blank\">" + processDate(lastDate) + "</a> <b> Logged out</b>";
        dc.appendChild(dod);
        let dsta = document.createElement("p");
        dsta.setAttribute("class", "statics");
        let dstas = "";
        let dstatics = obj.last.statics;
        dstas += staticsToInnerHTML(dstatics) || "";
        if (dstas.length > 0) {
            dsta.innerHTML = dstas;
            dc.appendChild(dsta);
        }
        //madetime
        let madetime = document.createElement("p");
        madetime.setAttribute("class", "madetime");
        madetime.innerHTML = "Forever memorized<br> - " + processTime(obj.time);
        dc.appendChild(madetime);
        //TODOs

        //final
        d.appendChild(dc);
        $("body").append(d);
    });
}

function handleLoadError() {
    $("#main").append("<p style=\"color: rgb(165,3,18); margin: auto;\"><br><br><b><i>Fail to load the data, please try to refresh the page.</i></b><p>");
}

function processDate(dateString) {
    if (typeof dateString !== 'string') return "";
    let a = dateString.split("-");
    let s = a[0];
    let m = monthTable[a[1]];
    s = m + " " + s;
    s = a[2].replace(/^0([0-9])$/, "$1") + " " + s;
    return s;
}

function processTime(timeString) {
    if (typeof timeString !== 'string') return "";
    let a = timeString.split(" ");
    return a[1].replace(/^0([0-9])$/, "$1") + " " + a[2] + " " + a[3];
}

function genIcon(fp) {
    
}

function staticsToInnerHTML(statics) {
    if (Object.keys(statics).length == 0) return "";
    let toReturn = "";
    if (statics.hasOwnProperty("noOfImg") || statics.hasOwnProperty("noOfLink") || statics.hasOwnProperty("wordCount")) {
        toReturn += "With ";
        if (statics.hasOwnProperty("wordCount")) toReturn += statics.wordCount + " words";
        if (statics.hasOwnProperty("noOfImg")) toReturn += (toReturn.length > 5 ? " , " : "") + statics.noOfImg + " images";
        if (statics.hasOwnProperty("noOfLink")) toReturn += (toReturn.length > 5 ? " , " : "") + statics.noOfLink + " links";
        toReturn += ".<br><br>";
    }
    //tem should have some generated text with it
    //TODOs
    if (statics.hasOwnProperty("sentiment")) {
        toReturn += "Sentiment: " + statics.sentiment + "<br>";
    }
    return toReturn;
}

function getLang(obj) {
    if (!obj.first.hasOwnProperty("statics") && !obj.last.hasOwnProperty("statics")) return undefined;
    if (!obj.first.statics.hasOwnProperty("langs") && !obj.last.statics.hasOwnProperty("langs")) return undefined;
    let langs = {}
    if (obj.first.statics.langs !== undefined) {
        obj.first.statics.langs.forEach(l => {
            if (!langs.hasOwnProperty(l.toLowerCase())) {
                langs[l.toLowerCase()] = 1;
            } else {
                langs[l.toLowerCase()] += 1;
            }
        });
    }
    if (obj.last.statics.langs !== undefined) {
        obj.last.statics.langs.forEach(l => {
            if (!langs.hasOwnProperty(l.toLowerCase())) {
                langs[l.toLowerCase()] = 1;
            } else {
                langs[l.toLowerCase()] += 1;
            }
        });
    }
    let sortable = [];
    Object.keys(langs).forEach(l => {
        sortable.push([l, langs[l]]);
    });
    if (sortable.length == 0) return undefined;
    sortable.sort((a, b) => { return b[1] - a[1]; });
    return sortable[0][0].charAt(0).toUpperCase() + sortable[0][0].slice(1);
}