const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {

  socket.on("joinRoom", ({ name, room, color }) => {

    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = { players: [], turn: 0 };
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

    const roll = Math.floor(Math.random() * 6) + 1;
    io.to(room).emit("roll", roll);

    player.position = (player.position + roll) % 20;

    game.turn = (game.turn + 1) % game.players.length;

    io.to(room).emit("state", game);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
