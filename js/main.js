let dataJSON;
let gsbg = new Image();

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
        let firstDateY = obj.first.date.split("-")[0];
        let lastDateY = obj.last.date.split("-")[0];
        //create elements
        let a = document.createElement("a");
        a.href = "javascript:void(0)"
        a.setAttribute("onclick", `showGravestoneDetail("${idds}")`);
        a.setAttribute("class", "gravestone");
        let canvas = document.createElement("canvas");
        canvas.width = 100;
        canvas.height = 150;
        //draw
        let ctx = canvas.getContext('2d');
        //ctx.drawImage($("#gsbg"), 0, 0, 100, 150);
        ctx.textAlign = 'center';
        ctx.font = "12px 'Syne Mono'"
        ctx.fillStyle = "white";
        ctx.fillText(name, 50, 75);
        ctx.fillText(firstDateY + " ~ " + lastDateY, 50, 125);
        //
        a.appendChild(canvas);
        $("#main").append(a);
        //append graveStone detail
        let d = document.createElement("div");
        d.setAttribute("class", "gravestoneDetail");
        d.id = idds;
        //append childs for details
        //TODOS
        $("body").append(d);
    });
}

function handleLoadError() {
    $("#main").append("<p style=\"color: rgb(165,3,18); margin: auto;\"><br><br><b><i>Fail to load the data, please try to refresh the page.</i></b><p>");
}