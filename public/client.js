const socket = io();

const boardSize = 1024;

// ТОЧНЫЕ координаты 20 клеток для поля 1024×1024
const cells = [

/* 1 старт (низ слева) */
{ x: 90, y: 930 },

/* вверх */
{ x: 90, y: 820 },
{ x: 90, y: 710 },
{ x: 90, y: 600 },
{ x: 90, y: 490 },
{ x: 90, y: 380 },
{ x: 90, y: 270 },

/* верх вправо */
{ x: 250, y: 120 },
{ x: 400, y: 120 },
{ x: 550, y: 120 },
{ x: 700, y: 120 },

/* вправо вниз */
{ x: 880, y: 270 },
{ x: 880, y: 380 },
{ x: 880, y: 490 },
{ x: 880, y: 600 },
{ x: 880, y: 710 },

/* низ влево */
{ x: 700, y: 930 },
{ x: 550, y: 930 },
{ x: 400, y: 930 },
{ x: 250, y: 930 }

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
showHype(players);

});

function drawPlayers(players){

const container = document.getElementById("tokens");

container.innerHTML="";

let index=0;

Object.values(players).forEach(p=>{

const pos = cells[p.position];

const el = document.createElement("div");

el.className="token";

el.style.background=p.color;

el.style.left=(pos.x + index*8)+"px";
el.style.top=(pos.y + index*8)+"px";

container.appendChild(el);

index++;

});

}

function showHype(players){

let text="";

Object.values(players).forEach(p=>{

text += p.name + ": " + p.hype + " хайп<br>";

});

document.getElementById("status").innerHTML=text;

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
