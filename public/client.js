const socket = io();

const sound = document.getElementById("diceSound");

const cells = [
{x:80,y:520},{x:180,y:520},{x:280,y:520},{x:380,y:520},
{x:480,y:520},{x:580,y:520},{x:680,y:520},
{x:720,y:460},{x:720,y:360},{x:720,y:260},
{x:720,y:160},{x:680,y:80},{x:580,y:80},
{x:480,y:80},{x:380,y:80},{x:280,y:80},
{x:180,y:80},{x:80,y:80},{x:40,y:160},
{x:40,y:260},{x:40,y:360},{x:40,y:460}
];

socket.on("update", players=>{

 players.forEach((p,i)=>{

  const el=document.getElementById("p"+i);

  if(!el)return;

  el.style.left=cells[p.position].x+"px";
  el.style.top=cells[p.position].y+"px";

 });

});

socket.on("dice", data=>{

 sound.play();

 document.getElementById("info").innerText=data.text;

});

socket.on("win", player=>{

 alert("Игрок "+(player+1)+" победил!");

});

function rollDice(){
 socket.emit("rollDice");
}
