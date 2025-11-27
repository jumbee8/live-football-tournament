// ----------------------
// ADATBÁZIS
// ----------------------
let DB = {
    teams: [],
    groups: [],
    matches: []
};

function saveDB() {
    localStorage.setItem("torna_db", JSON.stringify(DB));
}

function loadDB() {
    let raw = localStorage.getItem("torna_db");
    if (raw) DB = JSON.parse(raw);
}
loadDB();

// ----------------------
// CSAPAT HOZZÁADÁSA
// ----------------------
function addTeam() {
    let name = document.getElementById("teamName").value;
    if (!name) return alert("Nincs név!");

    DB.teams.push(name);
    saveDB();
    alert("Hozzáadva!");
}

// ----------------------
// CSOPORT GENERÁLÁS
// ----------------------
function createGroups() {
    let per = parseInt(document.getElementById("teamPerGroup").value);
    if (!per) return alert("Adj meg csapatszámot!");

    DB.groups = [];
    DB.matches = [];

    let t = [...DB.teams];

    while (t.length) {
        DB.groups.push(t.splice(0, per));
    }

    // meccsek generálása
    DB.groups.forEach(g => {
        for (let i = 0; i < g.length; i++) {
            for (let j = i + 1; j < g.length; j++) {
                DB.matches.push({
                    teamA: g[i],
                    teamB: g[j],
                    scoreA: "",
                    scoreB: ""
                });
            }
        }
    });

    saveDB();
    alert("Csoportok létrehozva!");
    fillMatchList();
}

// ----------------------
// EREDMÉNY MENTÉSE
// ----------------------
function saveResult() {
    let idx = document.getElementById("matchSelect").value;
    DB.matches[idx].scoreA = document.getElementById("scoreA").value;
    DB.matches[idx].scoreB = document.getElementById("scoreB").value;

    saveDB();
    alert("Eredmény mentve!");
}

// ----------------------
// ADMIN – meccsek listája
// ----------------------
function fillMatchList() {
    let sel = document.getElementById("matchSelect");
    if (!sel) return;
    sel.innerHTML = "";
    DB.matches.forEach((m, i) => {
        let opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `${m.teamA} – ${m.teamB}`;
        sel.appendChild(opt);
    });
}

// ----------------------
// INDEX – csoportok és eredmények megjelenítése
// ----------------------
function renderGroups() {
    let box = document.getElementById("groupDisplay");
    if (!box) return;
    box.innerHTML = "";

    DB.groups.forEach((g, i) => {
        let div = document.createElement("div");
        div.className = "group";
        div.innerHTML = `<h3>${i + 1}. csoport</h3>` + g.join("<br>");
        box.appendChild(div);
    });
}

function renderMatches() {
    let box = document.getElementById("matchDisplay");
    if (!box) return;

    box.innerHTML = "<h2>Mérkőzések</h2>";

    DB.matches.forEach(m => {
        let div = document.createElement("div");
        div.className = "match";
        div.textContent = `${m.teamA} ${m.scoreA || "-"} : ${m.scoreB || "-"} ${m.teamB}`;
        box.appendChild(div);
    });
}
