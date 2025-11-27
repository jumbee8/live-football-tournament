/*
  Közös adatműködés index.html és admin.html között.
  A tornához szükséges minden adatot localStorage-ben kezel.
  A főoldal (index.html) csak olvas, az admin.html írhat is.
*/

let DB_KEY = "focitorna_db_v1";

// Alap adatstruktúra
let db = {
  teams: [],
  groups: {},
  matches: {},
  knockout: [],
};

// --- ADATBETÖLTÉS ---
function loadDB() {
  let raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      db = JSON.parse(raw);
    } catch (e) {
      console.error("DB sérült, új adatbázis létrehozva.");
      saveDB();
    }
  }
}

// --- ADATMENTÉS ---
function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ------------------------------------------------------
//                 CSAPATKEZELÉS
// ------------------------------------------------------

function addTeam(teamName) {
  if (!teamName || teamName.trim() === "") return false;
  if (db.teams.includes(teamName)) return false;

  db.teams.push(teamName);
  saveDB();
  return true;
}

function deleteTeams() {
  db.teams = [];
  db.groups = {};
  db.matches = {};
  db.knockout = [];
  saveDB();
}

// ------------------------------------------------------
//                 CSOPORTKÉPZÉS
// ------------------------------------------------------

function autoGroups(byGroups, number) {
  if (db.teams.length < 2) return false;

  let teams = [...db.teams];
  let groupCount = 1;

  if (byGroups) {
    groupCount = Math.max(1, Math.floor(number));
  } else {
    let perGroup = Math.max(1, Math.floor(number));
    groupCount = Math.ceil(teams.length / perGroup);
  }

  let groups = {};
  for (let i = 0; i < groupCount; i++) {
    groups["Csoport " + String.fromCharCode(65 + i)] = [];
  }

  let idx = 0;
  for (let t of teams) {
    let g = "Csoport " + String.fromCharCode(65 + (idx % groupCount));
    groups[g].push(t);
    idx++;
  }

  db.groups = groups;
  db.matches = {};
  db.knockout = [];
  saveDB();
  return true;
}

function manualGroups(text) {
  let lines = text.trim().split("\n");
  let groups = {};

  for (let line of lines) {
    let p = line.split(":");
    if (p.length < 2) continue;

    let name = p[0].trim();
    let teams = p[1].split(",").map(x => x.trim()).filter(Boolean);

    if (teams.length) groups[name] = teams;
  }

  db.groups = groups;
  db.matches = {};
  db.knockout = [];
  saveDB();
}

// ------------------------------------------------------
//                    MÉRKŐZÉSEK
// ------------------------------------------------------

function ensureMatches() {
  for (let g in db.groups) {
    let arr = db.groups[g];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        let key = `${g}_${i}_${j}`;
        if (!db.matches[key]) {
          db.matches[key] = ["", ""];
        }
      }
    }
  }
}

function saveMatch(g, i, j, home, away) {
  let key = `${g}_${i}_${j}`;
  db.matches[key] = [String(home), String(away)];
  saveDB();
}

// ------------------------------------------------------
//                  TABELLASZÁMÍTÁS
// ------------------------------------------------------

function calcTable(gName) {
  const teams = db.groups[gName] || [];
  const stats = {};

  teams.forEach(t => {
    stats[t] = {
      played: 0,
      points: 0,
      gf: 0,
      ga: 0,
      gd: 0
    };
  });

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      let key = `${gName}_${i}_${j}`;
      let sc = db.matches[key] || ["", ""];

      let a = sc[0] === "" ? null : parseInt(sc[0]);
      let b = sc[1] === "" ? null : parseInt(sc[1]);

      if (a === null || b === null) continue;

      let t1 = teams[i];
      let t2 = teams[j];

      stats[t1].played++;
      stats[t2].played++;

      stats[t1].gf += a;
      stats[t1].ga += b;
      stats[t2].gf += b;
      stats[t2].ga += a;

      if (a > b) stats[t1].points += 3;
      else if (a < b) stats[t2].points += 3;
      else {
        stats[t1].points++;
        stats[t2].points++;
      }
    }
  }

  Object.keys(stats).forEach(t => {
    stats[t].gd = stats[t].gf - stats[t].ga;
  });

  return stats;
}

// ------------------------------------------------------
//                 KIESÉSES SZAKASZ
// ------------------------------------------------------

function generateKnockout() {
  db.knockout = [];

  for (let g in db.groups) {
    let table = calcTable(g);
    let rows = Object.keys(table).map(t => ({ team: t, ...table[t] }));

    rows.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    if (rows.length >= 2) {
      db.knockout.push({
        team1: rows[0].team,
        team2: rows[1].team,
        score1: "",
        score2: ""
      });
    }
  }

  saveDB();
}

// ------------------------------------------------------
//                 EXPORT FUNKCIÓK
// ------------------------------------------------------

function exportCSV() {
  let out = "";

  for (let g in db.groups) {
    out += g + "\n";
    let arr = db.groups[g];

    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        let key = `${g}_${i}_${j}`;
        let sc = db.matches[key] || ["", ""];
        out += `${arr[i]} vs ${arr[j]} : ${sc[0]}-${sc[1]}\n`;
      }
    }
    out += "\n";
  }

  let a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(out);
  a.download = "torna.csv";
  a.click();
}

// ------------------------------------------------------
//                INDÍTÁSKOR BETÖLTÉS
// ------------------------------------------------------

loadDB();
ensureMatches();
