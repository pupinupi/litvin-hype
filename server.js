const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

io.on("connection", socket => {

  socket.on("joinGame", data => {
    players[socket.id] = {
      id: socket.id,
      name: data.name,
      color: data.color,
      position: 0,
      hype: 0
    };

    socket.emit("init", players[socket.id]);
    io.emit("updatePlayers", Object.values(players));
  });

  socket.on("rollDice", () => {
    if (!players[socket.id]) return;

    const dice = Math.floor(Math.random() * 6) + 1;
    let player = players[socket.id];

    player.position = (player.position + dice) % 20;

    applyCellEffect(player);

    io.emit("diceResult", dice);
    io.emit("updatePlayers", Object.values(players));
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", Object.values(players));
  });
});

function applyCellEffect(player) {
  const effects = [
    0, 3, 2, "scandal", "risk",
    2, "scandal", 3, 5, "reset",
    "half", 3, "risk", 3, "skip",
    2, "scandal", 8, "reset", 4
  ];

  let effect = effects[player.position];

  if (typeof effect === "number") player.hype += effect;
  if (effect === "reset") player.hype = 0;
  if (effect === "half") player.hype = Math.floor(player.hype / 2);
}

http.listen(process.env.PORT || 3000);
