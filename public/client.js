const socket = io();

// ===== НАСТРОЙКИ =====

const COLORS = ["red","blue","green","yellow","purple","orange"];

const BOARD_SIZE = 20;

// клетки по порядку (по твоему списку)
const CELLS = [
 {type:"start", text:"Старт"},
 {type:"hype", value:3},
 {type:"hype", value:2},
 {type:"scandal"},
 {type:"risk"},
 {type:"hype", value:2},
 {type:"scandal"},
 {type:"hype", value:3},
 {type:"hype", value:5},
 {type:"lose_all"},
 {type:"jail"},
 {type:"hype", value:3},
 {type:"risk"},
 {type:"hype", value:3},
 {type:"skip"},
 {type:"hype", value:2},
 {type:"scandal"},
 {type:"hype", value:8},
 {type:"lose_all"},
 {type:"hype", value:4}
];

const SCANDALS = [
 {text:"-1 хайп", action:(p)=>p.hype-=1},
 {text:"-2 хайп", action:(p)=>p.hype-=2},
 {text:"-3 хайп", action:(p)=>p.hype-=3},
 {text:"-4 хайп", action:(p)=>p.hype-=4},
 {text:"-5 хайп", action:(p)=>p.hype-=5},
 {text:"-5 хайп и пропуск хода", action:(p)=>{p.hype-=5;p.skip=1;}},
 {text:"-3 хайп у всех игроков", action:(p,players)=>players.forEach(x=>x.hype-=3)}
];


// ===== HTML элементы =====

const menu = document.getElementById("menu");
const game = document.getElementById("game");

const nameInput = document.getElementById("name");
const roomInput = document.getElementById("room");

const joinBtn = document.getElementById("join");
const rollBtn = document.getElementById("roll");

const playersDiv = document.getElementById("players");
const diceDiv = document.getElementById("dice");
const infoDiv = document.getElementById("info");

const board = document.getElementById("board");


// ===== состояние =====

let players = [];
let myId = null;
let myColor = null;
let currentTurn = 0;


// ===== выбор цвета =====

const colorDiv = document.getElementById("colors");

COLORS.forEach(color=>{
 const el = document.createElement("div");
 el.className="color";
 el.style.background=color;

 el.onclick=()=>{
  myColor=color;
  document.querySelectorAll(".color").forEach(c=>c.classList.remove("selected"));
  el.classList.add("selected");
 };

 colorDiv.appendChild(el);
});


// ===== координаты клеток =====

const cellPositions = [];

function generatePath(){

 const rect = board.getBoundingClientRect();

 const w = rect.width;
 const h = rect.height;

 const margin = 60;

 const top = margin;
 const bottom = h-margin;
 const left = margin;
 const right = w-margin;

 // вверх
 for(let i=0;i<5;i++)
  cellPositions.push({
   x:left,
   y:bottom-(bottom-top)/5*i
  });

 // вправо
 for(let i=1;i<5;i++)
  cellPositions.push({
   x:left+(right-left)/5*i,
   y:top
  });

 // вниз
 for(let i=1;i<5;i++)
  cellPositions.push({
   x:right,
   y:top+(bottom-top)/5*i
  });

 // влево
 for(let i=1;i<5;i++)
  cellPositions.push({
   x:right-(right-left)/5*i,
   y:bottom
  });

}

setTimeout(generatePath,500);


// ===== вход =====

joinBtn.onclick=()=>{

 if(!myColor){
  alert("Выберите фишку");
  return;
 }

 socket.emit("join",
  roomInput.value,
  nameInput.value,
  myColor
 );

 menu.style.display="none";
 game.style.display="block";
};



// ===== бросок кубика =====

rollBtn.onclick=()=>{
 socket.emit("roll");
};



// ===== сервер прислал состояние =====

socket.on("state",state=>{

 players=state.players;
 currentTurn=state.turn;
 myId=socket.id;

 render();
});


// ===== рендер =====

function render(){

 renderPlayers();
 renderTokens();

 const me = players.find(p=>p.id===myId);

 if(!me) return;

 rollBtn.disabled=currentTurn!==myId;

 if(me.hype>=100){
  alert("ПОБЕДА!");
 }
}


// ===== список игроков =====

function renderPlayers(){

 playersDiv.innerHTML="";

 players.forEach(p=>{

  const div=document.createElement("div");

  div.innerHTML=`
   <span style="color:${p.color}">●</span>
   ${p.name}
   — ${p.hype} хайпа
   ${p.id===currentTurn?" ← ход":""}
  `;

  playersDiv.appendChild(div);
 });
}


// ===== фишки =====

function renderTokens(){

 document.querySelectorAll(".token").forEach(t=>t.remove());

 players.forEach(p=>{

  const pos=cellPositions[p.pos];

  if(!pos) return;

  const t=document.createElement("div");

  t.className="token";

  t.style.background=p.color;
  t.style.left=pos.x+"px";
  t.style.top=pos.y+"px";

  board.appendChild(t);
 });
}


// ===== кубик =====

socket.on("dice",value=>{

 diceDiv.innerHTML=value;

});


// ===== событие клетки =====

socket.on("event",text=>{
 infoDiv.innerHTML=text;
});


// ===== карточка скандал =====

socket.on("scandal",text=>{
 alert("СКАНДАЛ: "+text);
});
