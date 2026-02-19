const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Раздаём папку client
app.use(express.static(path.join(__dirname, "client")));

// Если заходят на сайт — отдаём index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Хранилище комнат
const rooms = {};

io.on("connection", (socket) => {
  console.log("Игрок подключился:", socket.id);

  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);

    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }

    rooms[roomName].push(socket.id);

    io.to(roomName).emit("roomData", rooms[roomName]);
  });

  socket.on("rollDice", ({ roomName, dice }) => {
    io.to(roomName).emit("diceRolled", dice);
  });

  socket.on("disconnect", () => {
    for (let room in rooms) {
      rooms[room] = rooms[room].filter(id => id !== socket.id);
    }
  });
});

server.listen(PORT, () => {
  console.log("Server запущен на порту", PORT);
});
