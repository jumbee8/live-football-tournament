// Adatbázis inicializálás
let DB={tournaments:[]};

function loadDB(){
    let raw = localStorage.getItem("torna_db");
    if(raw){
        try { DB = JSON.parse(raw); } 
        catch(e) { console.log("Hibás localStorage, újra inicializálva"); DB={tournaments:[]}; }
    }
    DB.tournaments = DB.tournaments || [];
}

function saveDB(){ localStorage.setItem("torna_db", JSON.stringify(DB)); }
loadDB();

let currentTournamentIndex=null;

function addTournament(name){
    if(!name) return alert("Adj nevet a tornának!");
    DB.tournaments.push({name,teams:[],groups:[],matches:[],knockouts:[],podium:[]});
    saveDB();
    renderTournamentList();
}

function deleteTournament(index){
    if(!confirm("Biztosan törlöd a tornát?")) return;
    DB.tournaments.splice(index,1);
    if(currentTournamentIndex===index) currentTournamentIndex=null;
    saveDB();
    renderTournamentList();
}

function selectTournament(i){
    currentTournamentIndex=i;
    alert("Torna kiválasztva: "+DB.tournaments[i].name);
    fillMatchList();
}

function addTeam(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let name=document.getElementById("teamName").value;
    if(!name) return alert("Adj csapatnevet!");
    DB.tournaments[currentTournamentIndex].teams.push(name);
    saveDB();
    renderTournamentList();
}

function createGroups(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let per=parseInt(document.getElementById("teamPerGroup").value);
    if(!per) return alert("Adj meg csapatszámot!");
    let t = DB.tournaments[currentTournamentIndex];
    t.groups=[]; t.matches=[];
    let teamsCopy=[...t.teams];
    while(teamsCopy.length){ t.groups.push(teamsCopy.splice(0,per)); }
    t.groups.forEach(g=>{
        for(let i=0;i<g.length;i++){
            for(let j=i+1;j<g.length;j++){
                t.matches.push({teamA:g[i],teamB:g[j],scoreA:"",scoreB:""});
            }
        }
    });
    saveDB();
    fillMatchList();
}

function saveResult(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let idx = document.getElementById("matchSelect").value;
    let t = DB.tournaments[currentTournamentIndex];
    t.matches[idx].scoreA = document.getElementById("scoreA").value;
    t.matches[idx].scoreB = document.getElementById("scoreB").value;
    saveDB();
    alert("Eredmény mentve!");
    fillMatchList();
}

function fillMatchList(){
    if(currentTournamentIndex===null) return;
    let t = DB.tournaments[currentTournamentIndex];
    let sel = document.getElementById("matchSelect");
    if(!sel) return;
    sel.innerHTML="";
    t.matches.forEach((m,i)=>{
        let opt=document.createElement("option");
        opt.value=i;
        opt.textContent = m.teamA+" – "+m.teamB;
        sel.appendChild(opt);
    });
}

function renderTournamentList(){
    let div=document.getElementById("tournamentList");
    if(!div) return;
    div.innerHTML="";
    DB.tournaments.forEach((t,i)=>{
        let d=document.createElement("div");
        d.innerHTML = "<b>"+t.name+"</b> <button onclick='selectTournament("+i+")'>Megnyitás</button> <button onclick='deleteTournament("+i+")'>Törlés</button> <div>Csapatok: "+t.teams.join(", ")+"</div>";
        div.appendChild(d);
    });
}

function renderTournamentsForIndex(){
    let box=document.getElementById("tournamentDisplay");
    if(!box) return;
    box.innerHTML="";
    DB.tournaments.forEach((t,i)=>{
        let div=document.createElement("div");
        div.innerHTML="<h2>"+t.name+"</h2>";
        t.groups.forEach((g,gi)=>{
            div.innerHTML+="<h3>"+(gi+1)+". csoport</h3>"+g.join("<br>");
        });
        div.innerHTML+="<h3>Mérkőzések</h3>";
        t.matches.forEach(m=>{
            div.innerHTML+="<div>"+m.teamA+" "+(m.scoreA||"-")+" : "+(m.scoreB||"-")+" "+m.teamB+"</div>";
        });
        box.appendChild(div);
    });
}

function generateKnockouts(){
    if(currentTournamentIndex===null) return alert("Válassz tornát!");
    let count=parseInt(document.getElementById("advanceCount").value);
    if(!count) return alert("Add meg hány csapat jusson tovább!");
    alert("Kieséses szakasz generálva (placeholder logika)");
}
