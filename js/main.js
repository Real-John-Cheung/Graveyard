
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

let bookmark = 0;

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
    //make sure all fonts loaded 
    document.fonts.load("12pt 'Benny Harvey RIP'").then(() => {
        document.fonts.load("20pt 'Modern Antiqua'").then(() => {
            //document.fonts.ready.then(getJson("./test.json"));// local
            document.fonts.ready.then(fetchJSON("graveList")); // from database
        });
    });
});

function fetchJSON(cla) {
    Parse.initialize('YFNmHwzbtxTmIZW0e1GPVBe23JdBa7trjSoGRcgI', 'kRuZ7KdAoCieYcO8tPGYegh6iDC8puJ6zu1Y5TA8') // init client
    Parse.serverURL = 'https://parseapi.back4app.com/'

    const c = Parse.Object.extend(cla);
    const q = new Parse.Query(c);
    q.limit(100);
    q.skip(bookmark);
    q.find().then((res) => {
        let objs = [];
        res.forEach(o => {
            let no = {};
            no.domain = o.get("domain");
            no.fingerPrint = o.get("fingerPrint");
            no.time = o.get("time");
            no.first = o.get("first");
            no.last = o.get("last");
            no.similarity = o.get("similarity");
            objs.push(no);
        });
        createGraveyard(objs, 1);
        bookmark += 100;
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
    //if (debug) console.log(document.fonts)
    for (let i = objs.length - 1; i > -1; i--){
        const obj = objs[i];
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
        let iconInfo = genIcon(obj.fingerPrint);

        //create elements
        let da = document.createElement("div");
        da.setAttribute("class", "gravestone");
        let a = document.createElement("a");
        a.href = "javascript:void(0)"
        a.setAttribute("onclick", `showGravestoneDetail("${idds}")`);
        let canvas = document.createElement("canvas");
        canvas.setAttribute("class", "canvas")
        canvas.width = 140;
        canvas.height = 160;
        //draw
        let ctx = canvas.getContext('2d');
        ctx.font = 'Benny Harvey RIP';

        //bg ?
        //let img = $("#gsbg")[0];
        //ctx.drawImage(img, 0, 0, canvas.width, canvas.height);//ugly :(
        
        //icon 
        iconInfo.forEach((c, i) => {
            ctx.fillStyle = `rgb(${c}, ${c}, ${c})`;
            let raw = Math.floor(i / 8);
            let col = i % 8;
            let a = 10;
            let x = (canvas.width - 8 * a) / 2 + raw * a;
            let y = 10 + col * a;
            ctx.fillRect(x, y, a, a);
        });

        //texts
        ctx.textAlign = 'center';
        ctx.font = '12pt "Benny Harvey RIP"'
        ctx.fillStyle = "white";
        ctx.fillText(name, canvas.width / 2, canvas.height * 0.75, 140);
        ctx.font = "14pt 'Benny Harvey RIP'";
        ctx.fillText(firstDateY + "  ~  " + lastDateY, canvas.width/2, canvas.height*0.9);
        // -- 
        a.appendChild(canvas);
        da.appendChild(a);
        $("#main").append(da);

        //append graveStone detail
        let d = document.createElement("div");
        d.setAttribute("class", "gravestoneDetail");
        d.id = idds;
        //append children of detail
        //exit button
        let exitButtonwrapper = document.createElement("p");
        exitButtonwrapper.setAttribute("style", "text-align: right;padding-right: 20px;height:5%;margin: 10px 0 0 0;");
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
        let detailIcon = document.createElement("canvas");
        detailIcon.setAttribute("class", "gravestoneDetailIcon");
        detailIcon.width = 160;
        detailIcon.height = 160;
        dictx = detailIcon.getContext("2d");
        // dictx.strokeStyle = "#fff";
        // dictx.lineWidth = 2;
        // dictx.beginPath();
        // dictx.arc(detailIcon.width / 2, detailIcon.height / 2, detailIcon.width / 2, 0, 2 * Math.PI);
        // dictx.stroke();
        iconInfo.forEach((c, i) => {
            dictx.fillStyle = `rgb(${c}, ${c}, ${c})`;
            let row = Math.floor(i / 8);
            let col = i % 8;
            let a = detailIcon.width / 8;
            let x = row * a;
            let y = col * a;
            dictx.fillRect(x, y, a, a);
            // if (i < 32) {
            //     dictx.strokeStyle = `rgb(${c}, ${c}, ${c})`;
            //     dictx.beginPath();
            //     dictx.moveTo(detailIcon.width / 2, 0);
            //     dictx.quadraticCurveTo((detailIcon.width / 2) + (detailIcon.width / 16) * (i - 16), detailIcon.height / 2, detailIcon.width / 2, detailIcon.height);
            //     dictx.stroke();
            // } else {
            //     dictx.strokeStyle = `rgb(${c}, ${c}, ${c})`;
            //     dictx.beginPath();
            //     dictx.moveTo(0, detailIcon.height / 2);
            //     dictx.quadraticCurveTo(detailIcon.width / 2, (detailIcon.height / 2) + ( (detailIcon.height / 16) * (i - 48)), detailIcon.width, detailIcon.height / 2);
            //     dictx.stroke();
            // }
        });
        icondomainwrapper.appendChild(detailIcon);
        //domain
        let domain = document.createElement("p");
        domain.setAttribute("class", "detailDomain");
        domain.innerHTML = "<b>" + name + "</b>";
        //lang
        let siteLang = getLang(obj);
        if (siteLang !== undefined) {
            domain.innerHTML += "<br><span style=\"font-size: medium;\">Major Language: "+siteLang+"</span><br>"
        }
        icondomainwrapper.appendChild(domain);
        dc.appendChild(icondomainwrapper);
        //fingerPrint
        let fingerprint = document.createElement("div");
        fingerprint.setAttribute("class", "detailFingerPrint");
        fingerprint.innerHTML = "<p>FingerPrint: </p>";//
        let barcode = document.createElement("img");
        barcode.setAttribute("class", "barcode");
        JsBarcode(barcode, obj.fingerPrint, {
            height: 40,
            font: 'Modern Antiqua',
            background: 'black',
            lineColor: 'white',
            width: 1,
            fontSize: 16
        });
        fingerprint.appendChild(barcode);
        dc.appendChild(fingerprint);
        //date of birth
        let dob = document.createElement("p");
        dob.setAttribute("class", "detailDob");
        dob.innerHTML = "<a href=\""+ obj.first.uri +"\" target=\"_blank\">" + processDate(firstDate) + "</a> <b> Online</b>";
        dc.appendChild(dob);
        let bsta = document.createElement("div");
        bsta.setAttribute("class", "statics");
        staticsToInnerHTML(obj.first.statics, bsta);
        dc.appendChild(bsta);
        //date of death
        let dod = document.createElement("p");
        dod.setAttribute("class", "detailDod");
        dod.innerHTML = "<a href=\""+ obj.last.uri +"\" target=\"_blank\">" + processDate(lastDate) + "</a> <b> Offine</b>";
        dc.appendChild(dod);
        let dsta = document.createElement("div");
        dsta.setAttribute("class", "statics");
        staticsToInnerHTML(obj.last.statics, dsta);
        dc.appendChild(dsta);
        //similarity
        if (obj.similarity && obj.similarity > 0) {
            let par = (obj.similarity * 100).toFixed(2);
            let similarity = document.createElement("p");
            similarity.setAttribute("class", "similarity");
            if (par > 75) {
                //TODOs use context free grammar?
                similarity.innerText = "It didn't change much through its whole life. The first image of it and the last image of it are " + par + "% similar."
            } else if (par > 50) {
                similarity.innerText = "It changed a lot in its time. But " + par + "% of the content in its last image is in its first image.";
            } else if (par > 25) {
                similarity.innerText = "It might come through bit events in its life. " + (100 - par) + "% of the content in its last image is different from what it looked like when it is born.";
            } else {
                similarity.innerText = "It became totally different at some point in its time. Only " + par + "% of the content in its last image is kept in its last image";
            }
            dc.appendChild(similarity)
        }
        //madetime
        let madetime = document.createElement("p");
        madetime.setAttribute("class", "madetime");
        madetime.innerHTML = "Forever memorized<br> - " + processTime(obj.time);
        dc.appendChild(madetime);
        //final
        d.appendChild(dc);
        $("body").append(d);
    }
    if (document.getElementById("loading")) document.getElementById("loading").parentNode.removeChild(document.getElementById("loading"));
    document.getElementById("loadMore").classList.remove("hidden");
}

function handleLoadError() {
    document.getElementById("loading").parentNode.removeChild(document.getElementById("loading"));
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
    // 8x8 grid with grey scale (16level)
    let toReturn = [];
    fp.split("").forEach(d => {
        toReturn.push(parseInt(d, 16) * 16);
    });
    return toReturn;
}

function staticsToInnerHTML(statics, tar) {
    if (Object.keys(statics).length == 0) return;
    
    if (statics.hasOwnProperty("noOfImg") || statics.hasOwnProperty("noOfLink") || statics.hasOwnProperty("wordCount")) {
        let str = ""
        str += "<p>With ";
        if (statics.hasOwnProperty("wordCount")) str += statics.wordCount + " words";
        if (statics.hasOwnProperty("noOfImg")) str += (str.length > 5 ? " , " : "") + statics.noOfImg + " images";
        if (statics.hasOwnProperty("noOfLink")) str += (str.length > 5 ? " , " : "") + statics.noOfLink + " links";
        str += ".</p>";
        let nos = document.createElement("div");
        nos.innerHTML = str;
        tar.appendChild(nos);
    }
    if (statics.hasOwnProperty("sentiment")) {
        let num = statics.sentiment;
        let sent = document.createElement("p");
        sent.innerHTML = "And a "
        if (num < - 0.5) {
            sent.innerHTML += "<i>very negative<i>";
        } else if (num < -0.2) {
            sent.innerHTML += "<i>quite negative<i>";
        } else if (num < -0.05) {
            sent.innerHTML += "<i>a bit negative<i>";
        } else if (num < 0.05) {
            sent.innerHTML += "<i>neutral<i>";
        } else if (num < 0.2) {
            sent.innerHTML += "<i>a bit positive<i>";
        } else if (num < 0.5) {
            sent.innerHTML += "<i>quite positive<i>";
        } else {
            sent.innerHTML += "<i>very positive<i>";
        }
        sent.innerHTML += " attitude."
        tar.appendChild(sent);
    }
    if (statics.hasOwnProperty("keywords") && statics.keywords.length > 0) {
        let can = document.createElement("canvas");
        can.setAttribute("class", "wordcloud");
        can.width = 480;
        can.height = 360;
        WordCloud(can, {
            list: norm(statics.keywords),
            fontFamily: "Modern Antiqua",
            color: deteminColor,
            backgroundColor: "#000",
            minSize: "12pt",
            weightFactor: 4,
            shrinkToFit: true
        });
        tar.appendChild(can)
    }   
    
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
    return sortable.slice(0, Math.min(sortable.length, 3)).map(e => {
        return e[0].charAt(0).toUpperCase() + e[0].substring(1);
    }).join(", ");
    
}

function map(n, start1, stop1, start2, stop2) {
    if (start1 === stop1) return (start2 + stop2) / 2;
    return ((n - start1) / (stop1 - start1) * (stop2 - start2) + start2);
}

function norm(raw) {
    let top = raw[0][1];
    let bottom = raw[raw.length - 1][1];
    let same;
    let tor = [];
    raw.forEach(it => {
        tor.push([it[0], map(it[1], top, bottom, 30, 10)]);
    });
    return tor;
}

function deteminColor(word, weight, fontSize, distance, theta) {
    let c = map(weight, 30, 10, 255, 150);
    c = Math.round(c);
    return `rgb(${c},${c},${c})`;
}

function loadMore() {
    //console.log("loadMore");
    fetchJSON("graveList");
}