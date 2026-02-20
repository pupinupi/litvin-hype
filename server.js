const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

let rooms = {};

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-4 хайп",
  "-5 хайп",
  "-5 хайп, пропусти ход"
];

const actions = [
  "start","+3","+2","scandal","risk","+2",
  "scandal","+3","+5","zero",
  "half_skip","+3","risk","+3",
  "skip","+2","scandal","+8",
  "zero","+4"
];

io.on("connection", socket => {

  socket.on("joinRoom", ({ name, room, color }) => {

    socket.join(room);

    if (!rooms[room]) rooms[room] = { players: [] };

    rooms[room].players.push({
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0,
      skip: false
    });

    io.to(room).emit("update", rooms[room]);
  });

  socket.on("rollDice", room => {

    const game = rooms[room];
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    if (player.skip) {
      player.skip = false;
      io.to(room).emit("update", game);
      return;
    }

    const dice = Math.floor(Math.random()*6)+1;
    player.position = (player.position + dice) % 20;

    const action = actions[player.position];

    if (action.startsWith("+"))
      player.hype += parseInt(action.replace("+",""));

    if (action === "zero")
      player.hype = 0;

    if (action === "half_skip") {
      player.hype = Math.floor(player.hype/2);
      player.skip = true;
    }

    if (action === "skip")
      player.skip = true;

    if (action === "risk") {
      const r = Math.floor(Math.random()*6)+1;
      if (r<=3) player.hype -=5;
      else player.hype +=5;
    }

    if (action === "scandal") {
      const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];
      const minus = parseInt(card);
      if (!isNaN(minus)) player.hype += minus;
      if (card.includes("пропусти")) player.skip=true;
      io.to(room).emit("scandal", card);
    }

    if (player.hype<0) player.hype=0;

    io.to(room).emit("dice", dice);
    io.to(room).emit("update", game);
  });

});

server.listen(PORT, ()=>console.log("Server started"));
