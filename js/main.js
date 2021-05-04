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
        canvas.width = 100;
        canvas.height = 150;
        //draw
        let ctx = canvas.getContext('2d');
        //bg
        //ctx.drawImage($("#gsbg"), 0, 0, 100, 150);
        //icon 
        //TODOS
        //texts
        ctx.textAlign = 'center';
        ctx.font = "12px 'Syne Mono'"
        ctx.fillStyle = "white";
        ctx.fillText(name, 50, 75);
        ctx.fillText(firstDateY + " ~ " + lastDateY, 50, 125);
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
        //date of birth
        let dob = document.createElement("p");
        dob.setAttribute("class", "detailDob");
        dob.innerHTML = "<b> Logged in on </b><a href=\""+ obj.first.uri +"\" target=\"_blank\">" + firstDate + "</a>";
        d.appendChild(dob);
        //date of death
        let dod = document.createElement("p");
        dod.setAttribute("class", "detailDod");
        dod.innerHTML = "<b> Logged out on </b><a href=\""+ obj.last.uri +"\" target=\"_blank\">" + lastDate + "</a>";
        d.appendChild(dod);
        //made by 
        //TODOs
        $("body").append(d);
    });
}

function handleLoadError() {
    $("#main").append("<p style=\"color: rgb(165,3,18); margin: auto;\"><br><br><b><i>Fail to load the data, please try to refresh the page.</i></b><p>");
}