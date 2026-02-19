const socket=io();
let code;
const positions=[];
for(let i=0;i<5;i++)positions.push({x:40+i*150,y:760});
for(let i=1;i<5;i++)positions.push({x:760,y:760-i*150});
for(let i=1;i<5;i++)positions.push({x:760-i*150,y:40});
for(let i=1;i<4;i++)positions.push({x:40,y:40+i*150});

function create(){
code=document.getElementById("room").value;
socket.emit("createRoom",code);
join();
}

function join(){
code=document.getElementById("room").value;
const name=document.getElementById("name").value;
socket.emit("joinRoom",{code,name});
document.getElementById("start").style.display="none";
document.getElementById("game").style.display="block";
}

function roll(){
socket.emit("rollDice",code);
}

socket.on("dice",({dice,room})=>{
render(room.players);
});

socket.on("update",(room)=>{
render(room.players);
});

socket.on("scandal",(card)=>{
const p=document.getElementById("popup");
p.innerText="СКАНДАЛ: "+card;
p.classList.remove("hidden");
setTimeout(()=>p.classList.add("hidden"),2000);
});

socket.on("winner",(name)=>{
alert("🔥 Победил "+name);
});

function render(players){
const board=document.getElementById("board");
board.innerHTML="";
players.forEach(p=>{
const t=document.createElement("div");
t.className="token";
t.style.background=p.color;
t.style.left=positions[p.position].x+"px";
t.style.top=positions[p.position].y+"px";
board.appendChild(t);
});
const info=document.getElementById("info");
info.innerHTML="";
players.forEach(p=>{
info.innerHTML+=p.name+" — "+p.hype+" хайпа<br>";
});
}
