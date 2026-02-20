const socket = io();

let myId;

// ТОЧНЫЕ координаты 20 клеток под board.jpg (600x600)
const cells = [

/* 1 старт */
{ x: 60, y: 540 },

/* вверх */
{ x: 60, y: 480 },
{ x: 60, y: 420 },
{ x: 60, y: 360 },
{ x: 60, y: 300 },
{ x: 60, y: 240 },
{ x: 60, y: 180 },

/* верх вправо */
{ x: 150, y: 120 },
{ x: 240, y: 120 },
{ x: 330, y: 120 },
{ x: 420, y: 120 },

/* вправо вниз */
{ x: 510, y: 180 },
{ x: 510, y: 240 },
{ x: 510, y: 300 },
{ x: 510, y: 360 },
{ x: 510, y: 420 },

/* низ влево */
{ x: 420, y: 540 },
{ x: 330, y: 540 },
{ x: 240, y: 540 },
{ x: 150, y: 540 }

];

function createRoom(){

const name = document.getElementById("name").value;
const color = document.getElementById("color").value;

socket.emit("createRoom",{name,color});

}

function joinRoom(){

const room = document.getElementById("roomInput").value;
const name = document.getElementById("name").value;
const color = document.getElementById("color").value;

socket.emit("joinRoom",{room,name,color});

startGame();

}

socket.on("roomCreated", room => {

document.getElementById("roomCode").innerText =
"Код комнаты: "+room;

startGame();

});

function startGame(){

document.getElementById("menu").style.display="none";
document.getElementById("game").style.display="block";

}

function rollDice(){

socket.emit("rollDice");

}

socket.on("dice", number => {

animateDice(number);

});

function animateDice(n){

const cube = document.getElementById("cube");

const rotations = {

1:"rotateX(0deg) rotateY(0deg)",
2:"rotateX(-90deg)",
3:"rotateY(90deg)",
4:"rotateY(-90deg)",
5:"rotateX(90deg)",
6:"rotateY(180deg)"

};

cube.style.transform = rotations[n];

}

socket.on("update", players => {

drawPlayers(players);

});

function drawPlayers(players){

const container = document.getElementById("tokens");

container.innerHTML="";

Object.values(players).forEach((p,index)=>{

const pos = cells[p.position];

if(!pos) return;

const el = document.createElement("div");

el.className="token";

el.style.background=p.color;

el.style.left=(pos.x + index*5)+"px";
el.style.top=(pos.y + index*5)+"px";

container.appendChild(el);

});

}

socket.on("scandalCard", card => {

document.getElementById("cardText").innerText = card.text;

document.getElementById("cardPopup").style.display="block";

});

function closeCard(){

document.getElementById("cardPopup").style.display="none";

}

socket.on("win", name => {

alert(name+" победил!");

});
