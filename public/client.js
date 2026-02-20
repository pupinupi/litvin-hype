const socket = io();

let myId;

const cells = [

{ x:50,y:520 },
{ x:50,y:450 },
{ x:50,y:380 },
{ x:50,y:310 },
{ x:50,y:240 },

{ x:50,y:170 },
{ x:50,y:100 },

{ x:150,y:100 },
{ x:250,y:100 },
{ x:350,y:100 },
{ x:450,y:100 },

{ x:550,y:100 },
{ x:550,y:170 },
{ x:550,y:240 },
{ x:550,y:310 },

{ x:550,y:380 },
{ x:550,y:450 },

{ x:450,y:520 },
{ x:350,y:520 },
{ x:250,y:520 }

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

Object.values(players).forEach(p=>{

const pos = cells[p.position];

const el = document.createElement("div");

el.className="token";

el.style.background=p.color;

el.style.left=pos.x+"px";
el.style.top=pos.y+"px";

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
