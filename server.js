const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// статические файлы
app.use(express.static(path.join(__dirname, "client")));

// чтобы точно открывался index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

let rooms = {};

io.on("connection", socket => {
  console.log("user connected");

  socket.on("joinRoom", ({ name, room, color }) => {

    socket.join(room);

    if (!rooms[room]) rooms[room] = { players: [] };

    rooms[room].players.push({
      id: socket.id,
      name,
      color,
      position: 0,
      hype: 0
    });

    io.to(room).emit("update", rooms[room]);
  });

  socket.on("rollDice", room => {

    const game = rooms[room];
    if (!game) return;

    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    player.position = (player.position + dice) % 20;

    player.hype += dice;

    io.to(room).emit("dice", dice);
    io.to(room).emit("update", game);
  });

});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
