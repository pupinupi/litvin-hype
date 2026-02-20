const socket = io();

let myId = null;

const cells = [
{ x:70,y:720 },
{ x:70,y:630 },
{ x:70,y:540 },
{ x:70,y:450 },
{ x:70,y:360 },

{ x:70,y:270 },
{ x:70,y:180 },
{ x:70,y:90 },

{ x:160,y:90 },
{ x:250,y:90 },
{ x:340,y:90 },
{ x:430,y:90 },
{ x:520,y:90 },

{ x:610,y:90 },

{ x:610,y:180 },
{ x:610,y:270 },
{ x:610,y:360 },
{ x:610,y:450 },
{ x:610,y:540 },
{ x:610,y:630 }
];


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


function join(){

 const name = document.getElementById("name").value;
 const room = document.getElementById("room").value;
 const color = document.getElementById("color").value;

 if(!name || !room){

  alert("Введите имя и комнату");

  return;
 }

 socket.emit("join", room, name, color);

 document.getElementById("menu").style.display="none";
 document.getElementById("game").style.display="block";
}


function roll(){

 socket.emit("roll");
}


socket.on("dice", number=>{

 document.getElementById("dice").innerHTML =
 "🎲 Выпало: " + number;

});


socket.on("event", text=>{

 document.getElementById("info").innerHTML =
 text;

});


socket.on("scandal", text=>{

 alert("СКАНДАЛ: " + text);

});


socket.on("state", data=>{

 ctx.clearRect(0,0,800,800);

 data.players.forEach(p=>{

  if(p.id===socket.id)
   myId=p.id;

  const cell = cells[p.pos];

  ctx.beginPath();

  ctx.arc(cell.x,cell.y,15,0,Math.PI*2);

  ctx.fillStyle=p.color;

  ctx.fill();

  ctx.fillStyle="white";

  ctx.fillText(p.name[0],cell.x-4,cell.y+4);

 });

});
