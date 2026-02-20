const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "client")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

const rooms = {};

// ===== ТВОИ 20 КЛЕТОК =====
const board = [
  "start",              //1
  "+3",                 //2
  "+2",                 //3
  "scandal",            //4
  "risk",               //5
  "+2",                 //6
  "scandal",            //7
  "+3",                 //8
  "+5",                 //9
  "reset",              //10 - весь хайп
  "halfSkip",           //11 -50% и пропуск
  "+3",                 //12
  "risk",               //13
  "+3",                 //14
  "skip",               //15
  "+2",                 //16
  "scandal",            //17
  "+8",                 //18
  "reset",              //19
  "+4"                  //20
];

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-4 хайп",
  "-5 хайп",
  "-5 хайп пропусти ход",
  "-3 хайп всем игрокам"
];

io.on("connection", socket => {

  socket.on("joinRoom", ({ room, name, color }) => {

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

    io.to(room).emit("update", rooms[room]);
  });

  socket.on("rollDice", (room) => {

    const data = rooms[room];
    if (!data) return;

    const player = data.players[data.turn];
    if (!player) return;

    // Пропуск хода
    if (player.skip) {
      player.skip = false;
      data.turn = (data.turn + 1) % data.players.length;
      io.to(room).emit("update", data);
      return;
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    player.position = (player.position + dice) % 20;

    const cell = board[player.position];
    let gained = 0;

    // ===== +ХАЙП =====
    if (cell.startsWith("+")) {
      gained = parseInt(cell.replace("+", ""));
      player.hype += gained;
    }

    // ===== СКАНДАЛ =====
    if (cell === "scandal") {
      const card = scandalCards[Math.floor(Math.random() * scandalCards.length)];

      if (card.includes("всем")) {
        data.players.forEach(p => {
          p.hype = Math.max(0, p.hype - 3);
        });
      } else if (card.includes("пропусти")) {
        player.hype -= 5;
        player.skip = true;
      } else {
        const minus = parseInt(card.match(/\d+/)[0]);
        player.hype -= minus;
      }

      io.to(room).emit("scandal", card);
    }

    // ===== РИСК =====
    if (cell === "risk") {
      const r = Math.floor(Math.random() * 6) + 1;
      if (r <= 3) player.hype -= 5;
      else player.hype += 5;
    }

    // ===== - ВЕСЬ ХАЙП =====
    if (cell === "reset") {
      player.hype = 0;
    }

    // ===== -50% и пропуск =====
    if (cell === "halfSkip") {
      player.hype = Math.floor(player.hype / 2);
      player.skip = true;
    }

    // ===== ПРОПУСТИ ХОД =====
    if (cell === "skip") {
      player.skip = true;
    }

    // Ограничение ниже 0
    if (player.hype < 0) player.hype = 0;

    // Перегрев (>8 за ход)
    if (gained > 8) {
      player.skip = true;
    }

    // Победа
    if (player.hype >= 100) {
      io.to(room).emit("winner", player.name);
      return;
    }

    data.turn = (data.turn + 1) % data.players.length;

    io.to(room).emit("dice", { dice, data });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room].players =
        rooms[room].players.filter(p => p.id !== socket.id);

      io.to(room).emit("update", rooms[room]);
    }
  });

});

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
