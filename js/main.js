let dataJSON;
let gsbg = new Image();
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
    getJson('./test.json');
});

function getJson(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.responseType = 'json';
    request.onload = () => {
        const resp = request.response;
        if (/^2[0-9][0-9]$/.test(request.status.toString())) {
            dataJSON = resp; // backup one for window resize
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
        //bg
        let img = $("#gsbg")[0];
        //ctx.drawImage(img, 0, 0, canvas.width, canvas.height);//ugly :(
        //icon 
        //TODOS
        let iconInfo = genIcon(obj.fingerPrint);
        //texts
        ctx.textAlign = 'center';
        ctx.font = "12px 'Benny Harvey RIP'"
        ctx.fillStyle = "white";
        ctx.fillText(name, canvas.width / 2, canvas.height * 0.6, 140);
        ctx.font = "14px 'Benny Harvey RIP'";
        ctx.fillText(firstDateY + "  ~  " + lastDateY, canvas.width/2, canvas.height*0.75);
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
        exitButtonwrapper.setAttribute("style", "text-align: right;padding-right: 20px;");
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
        //icon & domain
        let icondomainwrapper = document.createElement("div");
        icondomainwrapper.setAttribute("class", "icondomainWrapper");
        //icon
        //TODOS
        //domain
        let domain = document.createElement("p");
        domain.setAttribute("class", "detailDomain");
        domain.innerHTML = "<b>" + name + "</b>";
        icondomainwrapper.appendChild(domain);
        d.appendChild(icondomainwrapper);
        //fingerPrint
        let fingerprint = document.createElement("p");
        fingerprint.setAttribute("class", "detailFingerPrint");
        fingerprint.innerHTML = "FingerPrint: " + obj.fingerPrint;
        d.appendChild(fingerprint);
        //date of birth
        let dob = document.createElement("p");
        dob.setAttribute("class", "detailDob");
        dob.innerHTML = "<a href=\""+ obj.first.uri +"\" target=\"_blank\">" + processDate(firstDate) + "</a> <b> Logged in</b>";
        d.appendChild(dob);
        //date of death
        let dod = document.createElement("p");
        dod.setAttribute("class", "detailDod");
        dod.innerHTML = "<a href=\""+ obj.last.uri +"\" target=\"_blank\">" + processDate(lastDate) + "</a> <b> Logged out</b>";
        d.appendChild(dod);
        //made by 
        let madetime = document.createElement("p");
        madetime.setAttribute("class", "madetime");
        madetime.innerHTML = "Forever memorized<br> - " + processTime(obj.time);
        d.appendChild(madetime);
        //TODOs
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