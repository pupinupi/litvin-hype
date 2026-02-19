const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

let rooms = {};

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-4 хайп",
  "-5 хайп",
  "-5 хайп пропусти ход",
  "-3 хайп всем игрокам"
];

const board = [
  "start","+5","scandal","+3","risk",
  "+5","jail","+4","scandal","+3",
  "court","+6","risk","+4","scandal",
  "+5","+8","risk","+10","scandal"
];

io.on("connection", socket => {

  socket.on("createRoom", code => {
    rooms[code] = { players: [], turn: 0 };
    socket.join(code);
  });

  socket.on("joinRoom", ({code,name})=>{
    const colors = ["red","blue","lime","yellow","cyan","purple"];
    rooms[code].players.push({
      id: socket.id,
      name,
      position: 0,
      hype: 0,
      skip: false,
      color: colors[rooms[code].players.length]
    });
    socket.join(code);
    io.to(code).emit("update", rooms[code]);
  });

  socket.on("rollDice", code=>{
    const room = rooms[code];
    const player = room.players[room.turn];
    if(player.skip){
      player.skip=false;
      room.turn=(room.turn+1)%room.players.length;
      io.to(code).emit("update",room);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    player.position=(player.position+dice)%board.length;

    let hypeGain=0;
    const cell=board[player.position];

    if(cell.startsWith("+")){
      hypeGain=parseInt(cell.replace("+",""));
      player.hype+=hypeGain;
    }

    if(cell==="risk"){
      const roll=Math.floor(Math.random()*6)+1;
      if(roll<=3){ player.hype-=5; }
      else{ player.hype+=5; hypeGain+=5; }
    }

    if(cell==="jail"){
      player.hype=Math.floor(player.hype/2);
      player.skip=true;
    }

    if(cell==="court"){
      player.skip=true;
    }

    if(cell==="scandal"){
      const card=scandalCards[Math.floor(Math.random()*scandalCards.length)];
      if(card.includes("всем")){
        room.players.forEach(p=>p.hype=Math.max(0,p.hype-3));
      } else if(card.includes("пропусти")){
        player.hype-=5;
        player.skip=true;
      } else {
        const minus=parseInt(card.match(/\d+/)[0]);
        player.hype-=minus;
      }
      io.to(code).emit("scandal",card);
    }

    if(player.hype<0) player.hype=0;

    if(hypeGain>8){
      player.skip=true;
    }

    if(player.hype>=100){
      io.to(code).emit("winner",player.name);
      return;
    }

    room.turn=(room.turn+1)%room.players.length;
    io.to(code).emit("dice", {dice,room});
  });

});

server.listen(3000);
