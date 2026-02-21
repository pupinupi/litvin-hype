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

const scandalCards = [-1,-2,-3,-4,-5,-5];

io.on("connection", (socket) => {

  socket.on("joinRoom", ({name, room, color}) => {

    if (!rooms[room]) rooms[room] = {
      players: [],
      turn: 0
    };

    rooms[room].players.push({
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0,
      skip: false
    });

    socket.join(room);
    io.to(room).emit("updateState", rooms[room]);
  });

  socket.on("rollDice", (room) => {

    const roomData = rooms[room];
    if (!roomData) return;

    const player = roomData.players[roomData.turn];
    if (!player || player.id !== socket.id) return;

    if (player.skip) {
      player.skip = false;
      nextTurn(roomData);
      io.to(room).emit("updateState", roomData);
      return;
    }

    const roll = randomDice();
    player.position = (player.position + roll) % 20;

    applyCell(player);

    if (player.hype >= 100) {
      io.to(room).emit("winner", player.name);
      return;
    }

    nextTurn(roomData);

    io.to(room).emit("diceResult", roll);
    io.to(room).emit("updateState", roomData);
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
    }
  });

});

function randomDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function applyCell(player) {

  const type = cells[player.position];

  if (type.startsWith("+")) {
    player.hype += parseInt(type.replace("+",""));
  }

  if (type === "zero") player.hype = 0;

  if (type === "half") player.hype = Math.floor(player.hype / 2);

  if (type === "skip") player.skip = true;

  if (type === "risk") {
    const roll = randomDice();
    if (roll <= 3) player.hype -= 5;
    else player.hype += 5;
  }

  if (type === "scandal") {
    const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];
    player.hype += card;
  }

  if (player.hype < 0) player.hype = 0;
}

function nextTurn(room) {
  room.turn = (room.turn + 1) % room.players.length;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running"));
