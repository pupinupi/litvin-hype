// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRr8XtgxVkNeAgK-GYgmJnUz4Ed2ubyRc",
  authDomain: "lithype.firebaseapp.com",
  projectId: "lithype",
  storageBucket: "lithype.appspot.com",
  messagingSenderId: "320350268009",
  appId: "1:320350268009:web:68dbeb78788cf681dd50f8"
};

// Инициализация
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Игровые переменные
let playerId = Date.now().toString();
let name, roomCode, emoji;
let players = {};
let turnIndex = 0;

// Координаты клеток (пример)
const coords = [
 {x:20,y:260},{x:70,y:260},{x:120,y:260},{x:170,y:260},{x:220,y:260},
 {x:270,y:260},{x:270,y:210},{x:270,y:160},{x:270,y:110},{x:270,y:60},
 {x:220,y:60},{x:170,y:60},{x:120,y:60},{x:70,y:60},{x:20,y:60},
 {x:20,y:110},{x:20,y:160},{x:20,y:210},{x:70,y:210},{x:120,y:210}
];

// Выбор фишки
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
    document.getElementById("lobby").style.display="none";
    document.getElementById("game").style.display="block";
    listenRoom(roomRef);
  });
}

// Слушаем изменения комнаты
function listenRoom(roomRef){
  roomRef.onSnapshot(doc=>{
    const data = doc.data();
    players = data.players;
    turnIndex = data.turnIndex;
    renderPlayers();
    updateTurn();
  });
}

// Отображение игроков
function renderPlayers(){
  const playersDiv = document.getElementById("players");
  playersDiv.innerHTML="";
  Object.keys(players).forEach(id=>{
    const p = players[id];
    const el = document.createElement("div");
    el.className="token";
    el.innerText=p.emoji;
    const pos = coords[p.pos] || {x:20,y:260};
    el.style.left=pos.x+"px";
    el.style.top=pos.y+"px";
    playersDiv.appendChild(el);
  });
}

// Чей ход
function updateTurn(){
  const ids = Object.keys(players);
  if(ids.length>0){
    document.getElementById("turn").innerText = "Ход: "+players[ids[turnIndex]].name;
    updateHypeDisplay();
  }
}

// Обновление хайпа
function updateHypeDisplay(){
  const ids = Object.keys(players);
  if(ids.length>0){
    const p = players[ids[turnIndex]];
    document.getElementById("hypeText").innerText = `Хайп: ${p.hype} / 70`;
    document.getElementById("hypeFill").style.width = (p.hype/70*100)+"%";
  }
}

// Бросок кубика
function rollDice(){
  const ids = Object.keys(players);
  if(ids[turnIndex] != playerId) return alert("Не твой ход!");
  let dice = Math.floor(Math.random()*6)+1;
  movePlayer(dice);
}

// Движение игрока и применение клетки
function movePlayer(steps){
  const roomRef = db.collection("rooms").doc(roomCode);
  let p = players[playerId];
  let newPos = p.pos + steps;
  if(newPos>19) newPos=19;

  let newHype = p.hype + 3; // пример +3, заменим под логику клетки

  roomRef.update({
    [`players.${playerId}.pos`]: newPos,
    [`players.${playerId}.hype`]: newHype,
    turnIndex: (turnIndex+1)%Object.keys(players).length
  });
}
