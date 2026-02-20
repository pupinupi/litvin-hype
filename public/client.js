const socket = io();

/*
Координаты в процентах от изображения
0% = левый край
100% = правый край
*/

const cells = [

{ x: 8, y: 92 },  // старт

{ x: 8, y: 80 },
{ x: 8, y: 68 },
{ x: 8, y: 56 },
{ x: 8, y: 44 },
{ x: 8, y: 32 },
{ x: 8, y: 20 },

{ x: 22, y: 10 },
{ x: 36, y: 10 },
{ x: 50, y: 10 },
{ x: 64, y: 10 },

{ x: 88, y: 20 },
{ x: 88, y: 32 },
{ x: 88, y: 44 },
{ x: 88, y: 56 },
{ x: 88, y: 68 },

{ x: 64, y: 92 },
{ x: 50, y: 92 },
{ x: 36, y: 92 },
{ x: 22, y: 92 }

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

1:"rotateX(0deg)",
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

let offset = 0;

Object.values(players).forEach(p=>{

const pos = cells[p.position];

const el = document.createElement("div");

el.className="token";

el.style.background=p.color;

el.style.left = (pos.x + offset) + "%";
el.style.top = (pos.y + offset) + "%";

container.appendChild(el);

offset += 1.5;

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
