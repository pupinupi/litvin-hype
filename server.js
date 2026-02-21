const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const cells = [
  "start","+3","+2","scandal","risk","+2","scandal","+3","+5","zero",
  "half","+3","risk","+3","skip","+2","scandal","+8","zero","+4"
];

const scandalCards = [
 "-1 хайп","-2 хайп","-3 хайп","-4 хайп","-5 хайп","-5 хайп, пропусти ход"
];

io.on("connection", socket => {

  socket.on("joinRoom", ({name,room,color})=>{
    if(!rooms[room]) rooms[room]={players:[],turn:0};

    rooms[room].players.push({
      id:socket.id,
      name,
      color,
      position:0,
      hype:0,
      skip:false
    });

    socket.join(room);
    io.to(room).emit("state",rooms[room]);
  });

  socket.on("rollDice",(room)=>{
    const data=rooms[room];
    if(!data) return;

    const player=data.players[data.turn];
    if(!player || player.id!==socket.id) return;

    if(player.skip){
      player.skip=false;
      nextTurn(data);
      io.to(room).emit("state",data);
      return;
    }

    const roll=randomDice();
    io.to(room).emit("roll",roll);

    player.position=(player.position+roll)%20;

    let gained=applyCell(player);

    if(gained>8) player.skip=true;

    if(player.hype>=100){
      io.to(room).emit("winner",player.name);
      return;
    }

    nextTurn(data);
    io.to(room).emit("state",data);
  });

  socket.on("disconnect",()=>{
    for(let r in rooms){
      rooms[r].players=rooms[r].players.filter(p=>p.id!==socket.id);
    }
  });

});

function randomDice(){ return Math.floor(Math.random()*6)+1; }

function applyCell(player){
  const type=cells[player.position];
  let gained=0;

  if(type.startsWith("+")){
    gained=parseInt(type.replace("+",""));
    player.hype+=gained;
  }

  if(type==="zero") player.hype=0;

  if(type==="half"){
    player.hype=Math.floor(player.hype/2);
  }

  if(type==="skip") player.skip=true;

  if(type==="risk"){
    const r=randomDice();
    if(r<=3){ player.hype-=5; gained=-5; }
    else { player.hype+=5; gained=5; }
  }

  if(type==="scandal"){
    const card=scandalCards[Math.floor(Math.random()*scandalCards.length)];
    io.emit("scandal",card);
    const minus=parseInt(card);
    if(!isNaN(minus)) player.hype+=minus;
    if(card.includes("пропусти")) player.skip=true;
  }

  if(player.hype<0) player.hype=0;
  return gained;
}

function nextTurn(room){
  room.turn=(room.turn+1)%room.players.length;
}

server.listen(process.env.PORT||3000);
