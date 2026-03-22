import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRr8XtgxVkNeAgK-GYgmJnUz4Ed2ubyRc",
  authDomain: "lithype.firebaseapp.com",
  databaseURL: "https://litmhype-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "lithype",
  storageBucket: "lithype.firebasestorage.app",
  messagingSenderId: "320350268009",
  appId: "1:320350268009:web:68dbeb78788cf681dd50f8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Игровые данные
let playerId = Date.now().toString();
let roomId = "";
let playerName = "";
let playerToken = "🚗";

// Координаты под твоё поле
let path = [
{x:40, y:237},{x:40, y:189},{x:41, y:145},{x:42, y:99},{x:46, y:51},
{x:102, y:38},{x:149, y:38},{x:208, y:40},{x:261, y:38},{x:315, y:37},
{x:377, y:50},{x:380, y:102},{x:381, y:145},{x:381, y:191},{x:374, y:243},
{x:320, y:257},{x:264, y:257},{x:202, y:255},{x:141, y:252},{x:92, y:252}
];

// Клетки
let cells=[
"start","+3","+2","scandal","risk","+2","scandal","+3","+5","block",
"-8skip","+3","risk","+3","skip","+2","scandal","+8","block","+4"
];

// Выбор фишки
document.querySelectorAll(".token").forEach(t=>{
  t.onclick=()=>{
    document.querySelectorAll(".token").forEach(x=>x.classList.remove("selected"));
    t.classList.add("selected");
    playerToken=t.innerText;
  }
});

// Создать комнату
window.createRoom = async function(){
  playerName=document.getElementById("nameInput").value;
  roomId=Math.random().toString(36).substring(2,6);

  await set(ref(db,"rooms/"+roomId),{
    turn:0,
    players:{}
  });

  alert("Код комнаты: "+roomId);
  joinRoom();
};

// Войти в комнату
window.joinRoom = async function(){
  playerName=document.getElementById("nameInput").value;
  roomId=document.getElementById("roomInput").value || roomId;

  let snap = await get(ref(db,"rooms/"+roomId+"/players"));
  let count = snap.exists() ? Object.keys(snap.val()).length : 0;

  await set(ref(db,"rooms/"+roomId+"/players/"+playerId),{
    name:playerName,
    token:playerToken,
    pos:0,
    hype:10,
    skip:false,
    order: count
  });

  document.getElementById("lobby").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  listenRoom();
};

// Слушаем изменения комнаты
function listenRoom(){
  onValue(ref(db,"rooms/"+roomId),(snap)=>{
    let data=snap.val();
    if(!data) return;
    renderPlayers(data.players);
  });
}

// Рендер игроков
function renderPlayers(players){
  let board=document.getElementById("board");
  board.innerHTML="";

  Object.values(players).forEach(p=>{
    let el=document.createElement("div");
    el.className="player";
    el.innerText=p.token;

    let pos=path[p.pos];
    el.style.left=pos.x+"px";
    el.style.top=pos.y+"px";

    board.appendChild(el);
  });

  let text="";
  Object.values(players).forEach(p=>{
    text+=`${p.name}: ${p.hype}<br>`;
  });

  document.getElementById("players").innerHTML=text;
}

// Ход игрока
window.rollDice = async function(){
  let snap=await get(ref(db,"rooms/"+roomId));
  let room=snap.val();

  // очередь по order
  let playersArr = Object.entries(room.players)
    .sort((a,b)=>a[1].order - b[1].order);
  let ids = playersArr.map(p=>p[0]);
  let current = ids[room.turn];

  if(current!==playerId){
    alert("Не твой ход");
    return;
  }

  let p=room.players[playerId];

  if(p.skip){
    alert("Пропуск хода");
    p.skip=false;
    await set(ref(db,"rooms/"+roomId+"/players/"+playerId),p);
    nextTurn(room);
    return;
  }

  let roll=Math.floor(Math.random()*6)+1;
  document.getElementById("info").innerText="Выпало: "+roll;

  for(let i=0;i<roll;i++){
    p.pos++;
    if(p.pos>=20){
      p.pos=0;
      p.hype+=6;
    }
    await delay(300);
  }

  handleCell(p);
  await set(ref(db,"rooms/"+roomId+"/players/"+playerId),p);

  nextTurn(room);
};

// Смена хода
function nextTurn(room){
  let playersArr = Object.entries(room.players)
    .sort((a,b)=>a[1].order - b[1].order);
  let ids = playersArr.map(p=>p[0]);

  let next=(room.turn+1)%ids.length;
  set(ref(db,"rooms/"+roomId+"/turn"),next);
}

// Логика клеток
function handleCell(p){
  let c=cells[p.pos];

  if(c.startsWith("+")) p.hype+=parseInt(c);

  if(c==="block") p.hype-=10;

  if(c==="-8skip"){
    p.hype-=8;
    p.skip=true;
  }

  if(c==="skip") p.skip=true;

  if(c==="risk"){
    let r=Math.floor(Math.random()*6)+1;
    if(r<=3) p.hype-=5;
    else p.hype+=5;
  }

  if(c==="scandal"){
    let arr=[-1,-2,-3,-4,-5];
    p.hype+=arr[Math.floor(Math.random()*arr.length)];
  }

  if(p.hype<0) p.hype=0;

  if(p.hype>=70){
    alert(p.name+" победил!");
  }
}

function delay(ms){
  return new Promise(r=>setTimeout(r,ms));
}
