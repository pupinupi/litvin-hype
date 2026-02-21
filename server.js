const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-3 хайп у всех игроков",
  "-4 хайп",
  "-5 хайп",
  "-5 хайп и пропуск хода"
];

// твои 20 клеток по порядку
const board = [
  "start",
  "+3",
  "+2",
  "scandal",
  "risk",
  "+2",
  "scandal",
  "+3",
  "+5",
  "loseAll",
  "halfSkip",
  "+3",
  "risk",
  "+3",
  "skip",
  "+2",
  "scandal",
  "+8",
  "loseAll",
  "+4"
];

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, room, color }) => {

    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        turn: 0
      };
    }

    rooms[room].players.push({
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0,
      skip: false
    });

    io.to(room).emit("state", rooms[room]);
  });

  socket.on("rollDice", (room) => {

    const game = rooms[room];
    if (!game) return;

    const player = game.players[game.turn];
    if (!player || player.id !== socket.id) return;

    if (player.skip) {
      player.skip = false;
      game.turn = (game.turn + 1) % game.players.length;
      io.to(room).emit("state", game);
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    io.to(room).emit("roll", roll);

    player.position = (player.position + roll) % 20;

    const cell = board[player.position];

    let gainedThisTurn = 0;

    // ===== ЛОГИКА КЛЕТОК =====

    if (cell.startsWith("+")) {
      const value = parseInt(cell.replace("+",""));
      player.hype += value;
      gainedThisTurn += value;
    }

    if (cell === "loseAll") {
      player.hype = 0;
    }

    if (cell === "halfSkip") {
      player.hype = Math.floor(player.hype / 2);
      player.skip = true;
    }

    if (cell === "skip") {
      player.skip = true;
    }

    if (cell === "risk") {
      const riskRoll = Math.floor(Math.random() * 6) + 1;
      if (riskRoll <= 3) {
        player.hype -= 5;
      } else {
        player.hype += 5;
        gainedThisTurn += 5;
      }
      if (player.hype < 0) player.hype = 0;
      io.to(room).emit("roll", riskRoll);
    }

    if (cell === "scandal") {
      const card = scandalCards[Math.floor(Math.random() * scandalCards.length)];
      io.to(room).emit("scandal", card);

      if (card.includes("-1")) player.hype -= 1;
      if (card.includes("-2")) player.hype -= 2;
      if (card.includes("-3 хайп\"") && !card.includes("у всех")) player.hype -= 3;
      if (card.includes("-4")) player.hype -= 4;
      if (card.includes("-5 хайп\"") && !card.includes("пропуск")) player.hype -= 5;
      if (card.includes("у всех")) {
        game.players.forEach(p => {
          p.hype -= 3;
          if (p.hype < 0) p.hype = 0;
        });
      }
      if (card.includes("пропуск")) player.skip = true;

      if (player.hype < 0) player.hype = 0;
    }

    // ===== ПЕРЕГРЕВ =====
    if (gainedThisTurn > 8) {
      player.skip = true;
    }

    // ===== ПОБЕДА =====
    if (player.hype >= 100) {
      io.to(room).emit("winner", player.name);
      return;
    }

    // следующий ход
    game.turn = (game.turn + 1) % game.players.length;

    io.to(room).emit("state", game);
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players =
        rooms[room].players.filter(p => p.id !== socket.id);
      io.to(room).emit("state", rooms[room]);
    }
  });

});

server.listen(3000, () => {
  console.log("Server started");
});
