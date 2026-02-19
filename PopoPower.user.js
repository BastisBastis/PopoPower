// ==UserScript==
// @name            PopoPower
// @version         0.2.0
// @description     Stora delar skamlöst stulna
// @match           https://*.popmundo.com/World/Popmundo.aspx/*
// @require         https://code.jquery.com/jquery-1.7.1.min.js
// @updateURL       https://gist.githubusercontent.com/BastisBastis/4f2003445e5363446d32342ae001a080/raw/PopoPower.user.js
// @downloadURL     https://gist.githubusercontent.com/BastisBastis/4f2003445e5363446d32342ae001a080/raw/PopoPower.user.js
// @grant           GM_info
// ==/UserScript==

/* global jQuery */


(function () {
    "use strict";

    const jisQuery = jQuery.noConflict();
    const urlCurrent = window.location.href;

    const numCities = 49;
    let mediaFame = 0;
    let mediaMC = 0;

    function appendJsFile(src) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.src = src;
        jisQuery("head").append(script);
    }

    function canExec(regex) {
        return regex.test(urlCurrent);
    }

    function giveCheckboxDefaultTrue() {
        jisQuery("[id$=chkDelivery]").prop("checked", true);
    }

    function giveSortableTableFoldOption() {
        jisQuery("table.data.sortable").each(function () {
            const tableId = jisQuery(this).attr("id");

            jisQuery(this)
                .find("th.header")
                .not(".width60")
                .each(function () {
                    const buttons = `
                        &nbsp;<input type="button" onclick="jQuery('#${tableId} tbody').hide();" value="Hide">
                        &nbsp;<input type="button" onclick="jQuery('#${tableId} tbody').show();" value="Show">
                    `;
                    jisQuery(this).append(buttons);
                });
        });
    }

    function giveScoringNumberValues() {
        jisQuery("a[href*='Scoring']").each(function () {
            let value = jisQuery(this).attr("title");
            value = value.substring(0, value.lastIndexOf("/"));
            value = `${jisQuery(this).text()} (${value})`;
            jisQuery(this).text(value);
        });
    }

    function giveScoringProgressBarPercentages() {
        jisQuery('div[class*="rogressBar"]').each(function () {
            let value = jisQuery(this).attr("title");
            value = value.substring(0, value.indexOf("%"));

            const span = `
                <span style="text-align:center;font-weight:400;font-size:smaller;">
                    &nbsp;${value}%
                </span>
            `;

            jisQuery(this).children("div:first").append(span);
        });
    }

    function giveScoringNegativeProgressBarPercentages() {
        jisQuery(".plusMinusBar").each(function () {
            let value = jisQuery(this).attr("title");
            value = parseInt(value.substring(0, value.indexOf("%")));

            const span = `
                <span style="text-align:center;font-weight:400;font-size:smaller;">
                    &nbsp;${value}%
                </span>
            `;

            if (value >= 0) {
                jisQuery(this).children("div").eq(1).children().append(span);
            } else {
                jisQuery(this).children("div").eq(0).children().append(span);
            }
        });
    }

    function addsGlobalFameMedia() {
        jisQuery("a[href^='/World/Popmundo.aspx/Help/Scoring/']").each(function () {
            let value = jisQuery(this).attr("title").replace("/26", "");
            mediaFame += parseInt(value);
        });

        jisQuery("#tablefame div[class$='ProgressBar']").each(function () {
            let value = jisQuery(this).attr("title").replace("%", "");
            mediaMC += parseInt(value);
        });

        jisQuery("tr:first").after(function () {
            const avgFame = (mediaFame / numCities).toFixed(2);
            const avgMC = (mediaMC / numCities).toFixed(0);

            const row = `
                <tr class="even">
                    <td><b>Global</b></td>
                    <td>${avgFame}</td>
                    <td>
                        <div class="greenProgressBar" title="${avgMC}%">
                            <div class="low" style="width:${avgMC}%;">
                                <span style="text-align:center;font-weight:400;font-size:smaller;">
                                    &nbsp;${avgMC}%
                                </span>
                            </div>
                        </div>
                    </td>
                </tr>
            `;

            jisQuery(this).after(row);
        });
    }

    function AddsTicketPrice() {
        const priceMap = {
            0: "5$", 1: "5$", 2: "5$",
            3: "7$",
            4: "9$",
            5: "12$",
            6: "15$",
            7: "18$",
            8: "20$",
            9: "25$",
            10: "30$",
            11: "35$",
            12: "40$",
            13: "45$",
            14: "50$",
            15: "65$",
            16: "70$"
        };

        jisQuery("a[href^='/World/Popmundo.aspx/Help/Scoring/']").each(function () {
            let value = jisQuery(this).attr("title").replace("/26", "");
            const price = priceMap[parseInt(value)];

            if (price) {
                jisQuery(this).after(
                    `<span style="color:#485663">&nbsp;${price}</span>`
                );
            }
        });
    }

    function getFilterCharacterID() {
        const index = location.href.indexOf("#") + 1;
        return index !== 0 ? location.href.substring(index) : "";
    }

    function getFilterLocaleBaseURL() {
        const url = location.href;
        const worldIndex = url.lastIndexOf("/World");
        const hashIndex = url.lastIndexOf("#");

        return hashIndex < 0
            ? url.substring(worldIndex) + "#"
            : url.substring(worldIndex, hashIndex) + "#";
    }

    function addObjectFilterInLocation() {
        const onclick = `
            window.location.assign('${getFilterLocaleBaseURL()}' +
            document.getElementById('textFilterID').value);
            window.location.reload();
        `;

        const row = `
            <tr class="group">
                <td></td>
                <td colspan="2">Filter Items</td>
            </tr>
            <tr class="even hoverable">
                <td></td>
                <td>
                    <input type="number" min="1" class="round width100px"
                        style="padding:3px;border-radius:7px"
                        id="textFilterID"
                        placeholder="Character ID"
                        value="${getFilterCharacterID()}">
                    &nbsp;&nbsp;
                    <input type="button" value="Filter" onclick="${onclick}">
                </td>
                <td class="right"></td>
            </tr>
        `;

        jisQuery("#checkedlist thead").append(row);
    }

    function filterObjectsInLocation() {
        const filterId = getFilterCharacterID();

        jisQuery("#checkedlist tbody tr.hoverable").each(function () {
            let hide = true;

            jisQuery(this)
                .find(`a[id$="_lnkItemOwner"][href$="${filterId}"]`)
                .each(function () {
                    hide = false;
                });

            if (hide) {
                jisQuery(this).hide();
            }
        });
    }

    // ========================
    // Execution
    // ========================

    if (canExec(/\/World\/Popmundo.aspx\/Character\/OfferItem\/[0-9]*/)) {
        giveCheckboxDefaultTrue();
    }

    if (canExec(/\/World\/Popmundo.aspx\/Character\/Recipes\/[0-9]*/)) {
        giveSortableTableFoldOption();
    }

    giveScoringNumberValues();
    giveScoringProgressBarPercentages();
    giveScoringNegativeProgressBarPercentages();

    if (canExec(/\/World\/Popmundo.aspx\/Artist\/Popularity\/[0-9]*/)) {
        addsGlobalFameMedia();
    }

    if (
        canExec(/\/World\/Popmundo.aspx\/Artist\/Popularity\/[0-9]*/) ||
        canExec(/\/World\/Popmundo.aspx\/Artist\/InviteArtist\/[0-9]*/)
    ) {
        AddsTicketPrice();
    }

    if (canExec(/\/World\/Popmundo.aspx\/Locale\/ItemsEquipment\/.*/)) {
        addObjectFilterInLocation();
    }

    if (canExec(/\/World\/Popmundo.aspx\/Locale\/ItemsEquipment\/[0-9]*#[0-9]*$/)) {
        filterObjectsInLocation();
    }

  function addCharacterToolsPopupButton() {
    const container = document.getElementById("character-tools-shortcuts");
    if (!container) return;

    const btn = document.createElement("button");
    btn.innerText = "😊";
    btn.type = "button";
    btn.style.background = "transparent";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "14px";
    btn.style.padding = "1px 3px";
    btn.title = "Årsplan";

    btn.onclick = function() {
        let currentGameYear = 151;

        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "50%";
        popup.style.left = "50%";
        popup.style.transform = "translate(-50%, -50%)";
        popup.style.width = "90%";
        popup.style.maxWidth = "700px";
        popup.style.height = "80%";
        popup.style.maxHeight = "550px";
        popup.style.background = "#6d7f8c";
        popup.style.color = "white";
        popup.style.borderRadius = "10px";
        popup.style.boxShadow = "0 4px 15px rgba(0,0,0,0.4)";
        popup.style.padding = "10px";
        popup.style.zIndex = 10000;
        popup.style.display = "flex";
        popup.style.flexDirection = "column";
        popup.style.overflow = "hidden";

        // Stängknapp
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "✕";
        closeBtn.style.alignSelf = "flex-end";
        closeBtn.style.background = "transparent";
        closeBtn.style.color = "white";
        closeBtn.style.border = "none";
        closeBtn.style.fontSize = "18px";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => popup.remove();
        popup.appendChild(closeBtn);

        // Flik-knappar
        const tabsDiv = document.createElement("div");
        tabsDiv.style.display = "flex";
        tabsDiv.style.flexWrap = "wrap";
        tabsDiv.style.gap = "5px";
        tabsDiv.style.marginBottom = "10px";

        const tab1Btn = document.createElement("button");
        tab1Btn.innerText = "Plan";
        const tab2Btn = document.createElement("button");
        tab2Btn.innerText = "Info";

        [tab1Btn, tab2Btn].forEach(btn => {
            btn.style.flex = "1 1 45%";
            btn.style.padding = "5px";
            btn.style.background = "rgba(255,255,255,0.1)";
            btn.style.border = "none";
            btn.style.color = "white";
            btn.style.cursor = "pointer";
            btn.style.minWidth = "80px";
        });

        tabsDiv.appendChild(tab1Btn);
        tabsDiv.appendChild(tab2Btn);
        popup.appendChild(tabsDiv);

        // Innehållscontainer
        const contentDiv = document.createElement("div");
        contentDiv.style.flex = "1";
        contentDiv.style.overflow = "auto";
        contentDiv.style.background = "rgba(0,0,0,0.1)";
        contentDiv.style.padding = "5px";
        contentDiv.style.borderRadius = "5px";
        contentDiv.style.minHeight = "100px";
        popup.appendChild(contentDiv);

        // Funktion: real life-datum
        function getDateForGameDay(year, day) {
            const startDate = new Date("2025-11-05");
            const daysOffset = (year - 150) * 56 + (day - 1);
            const date = new Date(startDate);
            date.setDate(date.getDate() + daysOffset);
            return date.toISOString().slice(0,10);
        }

        // Funktion: generera Plan-tabell
        function generatePlanTable(year) {
            const olleWritesFirst = year % 2 === 0;
            const gigMap = Array(56).fill("");
            gigMap[52-1] = "Stockholm, 20:00";
            gigMap[53-1] = "Helsinki, 20:00";
            gigMap[54-1] = "Tallinn, 20:00";
            gigMap[55-1] = "Moscow, 20:00";
            gigMap[56-1] = "Vilnius, 20:00";
            gigMap[1-1]  = "Kyiv, 20:00";
            gigMap[2-1]  = "Baku, 20:00";
            gigMap[3-1]  = "Ankara, 14:00";
            gigMap[4-1]  = "Johannesburg, 22:00";
            gigMap[5-1]  = "Rio de Janeiro, 22:00";
            gigMap[6-1]  = "São Paulo, 20:00";
            gigMap[7-1]  = "Buenos Aires, 14:00";
            gigMap[8-1]  = "Melbourne, 22:00";
            gigMap[9-1]  = "Jakarta, 22:00";
            gigMap[10-1] = "Manila, 20:00";
            gigMap[11-1] = "Tokyo, 20:00";
            gigMap[12-1] = "Shanghai, 20:00";
            gigMap[13-1] = "Singapore, 14:00";
            gigMap[14-1] = "Antalya, 22:00";
            gigMap[15-1] = "Istanbul, 20:00";
            gigMap[16-1] = "Izmir, 20:00";
            gigMap[17-1] = "Rome, 20:00";
            gigMap[18-1] = "Milan, 20:00";
            gigMap[19-1] = "Sofia, 20:00";
            gigMap[20-1] = "Bucharest, 20:00";
            gigMap[21-1] = "Budapest, 20:00";
            gigMap[22-1] = "Berlin, 20:00";
            gigMap[23-1] = "Tromsø, 20:00";
            gigMap[24-1] = "Copenhagen, 20:00";
            gigMap[25-1] = "Warsaw, 20:00";
            gigMap[26-1] = "Dubrovnik, 20:00";
            gigMap[27-1] = "Belgrade, 20:00";
            gigMap[28-1] = "Sarajevo, 20:00";
            gigMap[29-1] = "Brussels, 20:00";
            gigMap[30-1] = "London, 20:00";
            gigMap[31-1] = "Amsterdam, 20:00";
            gigMap[32-1] = "Paris, 20:00";
            gigMap[33-1] = "Porto, 20:00";
            gigMap[34-1] = "Madrid, 20:00";
            gigMap[35-1] = "Barcelona, 20:00";
            gigMap[36-1] = "Glasgow, 14:00";
            gigMap[37-1] = "Montreal, 22:00";
            gigMap[38-1] = "New York, 20:00";
            gigMap[39-1] = "Toronto, 20:00";
            gigMap[40-1] = "Chicago, 20:00";
            gigMap[41-1] = "Nashville, 14:00";
            gigMap[42-1] = "Seattle, 22:00";
            gigMap[43-1] = "Los Angeles, 20:00";
            gigMap[44-1] = "Mexico City, 20:00";

            let html = `<div style="margin-bottom:5px; display:flex; justify-content:center; gap:5px; flex-wrap:wrap;">
                <button id="prevYear" style="flex:1 1 45%; min-width:80px;">⬅️</button>
                <span style="flex:1 1 45%; text-align:center; font-weight:bold;">År ${year}</span>
                <button id="nextYear" style="width:80px;">➡️</button>
            </div>`;

            html += `<div style="overflow-x:auto;"><table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse; width:100%;">
            <thead><tr style="background:#485663; color:white; text-align:center;">
            <th>Datum</th><th style="min-width:20">>Dag</th><th>Olle</th><th>William</th><th>Mupp</th><th>Händelser</th><th>Gig</th>
            </tr></thead><tbody>`;

            for (let day=1; day<=56; day++) {
                let olle="", william="", spokSkrivare="";
                for (let blockStart=1; blockStart<=56; blockStart+=10){
                    let writeStart=blockStart, writeEnd=blockStart+4;
                    let pressStart=blockStart+5, pressEnd=blockStart+9;
                    if (olleWritesFirst){
                        if (day>=writeStart && day<=writeEnd && day!==56) olle="🎵";
                        if (day>=pressStart && day<=pressEnd && day!==56) william="🎵";
                    } else {
                        if (day>=writeStart && day<=writeEnd && day!==56) william="🎵";
                        if (day>=pressStart && day<=pressEnd && day!==56) olle="🎵";
                    }
                }

                for (let start=1; start<=56; start+=8){
                    let end = start+4<=56 ? start+4 : 56;
                    if (day>=start && day<=end && day!==56) spokSkrivare="🎵";
                }

                var weekDay = ["Ti","On","To","Fr","Lö","Sö","Må"][day%7]

                 let events = "";
                
                
                var eventList = {
                  "9":"Big Bang",
                  "18":"Lansera A-sida",
                  "26":"Lansera B-sida",
                  "28":"Singelsläpp",
                  "46":"Lansera A-sida",
                  "52":"Ny setlist",
                  "56":"Singelsläpp",
                };
                
                
                if ( eventList[day]) {
                  events=eventList[day];
                }
                
              
                
                if (day ===10 && (year%2)===0) {
                  events = "Albumsläpp";
                }

                html += `<tr style="text-align:center;">
                    <td style="background:#e0e0e0; color:black;">${getDateForGameDay(year, day)}</td>
                    <td style="background:#d3d3d3; color:black;">${day}-${weekDay}</td>
                    <td style="background:#f9c2c2; color:black;">${olle}</td>
                    <td style="background:#c2f0f9; color:black;">${william}</td>
                    <td style="background:#d2f9c2; color:black;">${spokSkrivare}</td>
                    <td style="background:#f0e68c; font-weight:bold; color:black;">${events}</td>
                    <td style="background:#f5f5f5; color:black;">${gigMap[day-1]}</td>
                </tr>`;
            }

            html += '</tbody></table></div>';
            return html;
        }

        const infoHTML = `<div style="padding:5px; font-size:13px; line-height:1.4;">
            <p><b>Årsplanering i Popmundo:</b></p>
            <ul>
                <li>Ett år = 56 dagar.</li>
                <li>Big Bang = dag 9.</li>
                <li>Singlar släpps var 28:e dag.</li>
                <li>A-sidan görs offentlig 10 dagar innan singel 1</li>
                <li>B-sidan görs offentlig 2 dagar innan singel 1</li>
                <li>Album släpps vartannat år.</li>
                <li>Test</li>
            </ul>
        </div>`;

        // Visa initialt Plan
        contentDiv.innerHTML = generatePlanTable(currentGameYear);

        // Hantera flikar
        tab1Btn.onclick = () => contentDiv.innerHTML = generatePlanTable(currentGameYear);
        tab2Btn.onclick = () => contentDiv.innerHTML = infoHTML;

        // Hantera årknappar via event delegation
        contentDiv.addEventListener("click", function(e){
            if(e.target.id==="prevYear"){ currentGameYear--; contentDiv.innerHTML=generatePlanTable(currentGameYear);}
            if(e.target.id==="nextYear"){ currentGameYear++; contentDiv.innerHTML=generatePlanTable(currentGameYear);}
        });

        document.body.appendChild(popup);
    };

    container.appendChild(btn);
}

addCharacterToolsPopupButton();



})();
