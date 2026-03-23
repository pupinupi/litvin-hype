// Firebase config - вставь свои данные
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let playerId = Date.now().toString();
let name, roomCode, emoji;
let players = {};
let turnIndex = 0;
let hype = 0;

// выбор фишки
function selectEmoji(el){
  document.querySelectorAll("#emojiSelect span").forEach(e=>e.classList.remove("selected"));
  el.classList.add("selected");
  emoji = el.innerText;
}

// Вход в комнату
function joinRoom(){
  name = document.getElementById("name").value;
  roomCode = document.getElementById("room").value;
  if(!name || !roomCode || !emoji) return alert("Заполни всё");
  
  const roomRef = db.collection("rooms").doc(roomCode);
  
  roomRef.get().then(doc=>{
    if(!doc.exists){
      roomRef.set({players:{}, turnIndex:0});
    }
    roomRef.update({
      [`players.${playerId}`]:{name:name, emoji:emoji, pos:0, hype:0, skip:false}
    });
    lobby.style.display="none";
    game.style.display="block";
    listenRoom(roomRef);
  });
}

// слушаем изменения комнаты
function listenRoom(roomRef){
  roomRef.onSnapshot(doc=>{
    const data = doc.data();
    players = data.players;
    turnIndex = data.turnIndex;
    renderPlayers();
    updateTurn();
  });
}

// отображаем игроков
function renderPlayers(){
  playersDiv = document.getElementById("players");
  playersDiv.innerHTML="";
  Object.keys(players).forEach(id=>{
    const p = players[id];
    const el = document.createElement("div");
    el.className="token";
    el.innerText=p.emoji;
    el.style.left=(p.pos*15)+"px"; // упрощенно, потом под координаты
    el.style.top="50px";
    playersDiv.appendChild(el);
  });
}

// чей ход
function updateTurn(){
  const ids = Object.keys(players);
  document.getElementById("turn").innerText = "Ход: "+players[ids[turnIndex]].name;
  updateHypeDisplay();
}

function updateHypeDisplay(){
  const ids = Object.keys(players);
  let p = players[ids[turnIndex]];
  document.getElementById("hypeText").innerText = `Хайп: ${p.hype} / 70`;
  document.getElementById("hypeFill").style.width = (p.hype/70*100)+"%";
}

// бросок кубика
function rollDice(){
  const ids = Object.keys(players);
  if(ids[turnIndex]!=playerId) return alert("Не твой ход!");
  
  let dice = Math.floor(Math.random()*6)+1;
  movePlayer(dice);
}

// движение и применение клетки (пример)
function movePlayer(steps){
  const roomRef = db.collection("rooms").doc(roomCode);
  let p = players[playerId];
  let newPos = p.pos+steps;
  if(newPos>19) newPos=19; // всего 20 клеток
  let newHype = p.hype; // по клетке добавлять/убавлять хайп
  
  // пример: клетка +3
  newHype += 3;

  roomRef.update({
    [`players.${playerId}.pos`]:newPos,
    [`players.${playerId}.hype`]:newHype,
    turnIndex:(turnIndex+1)%Object.keys(players).length
  });
}
