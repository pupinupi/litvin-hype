const socket=io();

let room="";

const diceFaces=["⚀","⚁","⚂","⚃","⚄","⚅"];

const positions=[
{top:690,left:80},
{top:580,left:80},
{top:480,left:80},
{top:380,left:80},
{top:280,left:80},
{top:180,left:80},
{top:80,left:80},
{top:80,left:200},
{top:80,left:320},
{top:80,left:440},
{top:80,left:560},
{top:80,left:680},
{top:200,left:680},
{top:320,left:680},
{top:440,left:680},
{top:560,left:680},
{top:690,left:680},
{top:690,left:560},
{top:690,left:440},
{top:690,left:320}
];

function join(){

room=document.getElementById("room").value;

const name=document.getElementById("name").value;

const color=document.getElementById("color").value;

socket.emit("joinRoom",{name,room,color});

document.getElementById("menu").style.display="none";

document.getElementById("game").style.display="block";

}

function roll(){
socket.emit("rollDice",room);
}

socket.on("updatePlayers", game=>{
drawTokens(game.players);
drawPlayers(game.players,game.turn);
});

socket.on("diceRolled", data=>{

const dice=document.getElementById("dice");

dice.classList.remove("roll");

void dice.offsetWidth;

dice.classList.add("roll");

dice.innerText=diceFaces[data.dice-1];

document.getElementById("info").innerText=data.message;

drawTokens(data.game.players);

});

socket.on("scandalCard", text=>{
alert("Скандал: "+text);
});

socket.on("gameOver", name=>{
alert(name+" победил!");
});

function drawTokens(players){

const container=document.getElementById("tokens");

container.innerHTML="";

players.forEach(p=>{

const pos=positions[p.position];

const div=document.createElement("div");

div.className="token";

div.style.background=p.color;

div.style.top=pos.top+"px";

div.style.left=pos.left+"px";

container.appendChild(div);

});

}

function drawPlayers(players,turn){

let html="";

players.forEach((p,i)=>{

html+=p.name+" : "+p.hype;

if(i===turn) html+=" ← ход";

html+="<br>";

});

document.getElementById("players").innerHTML=html;

}
