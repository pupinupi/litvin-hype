const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {

    console.log("Player connected:", socket.id);

    players[socket.id] = {
        x: 200,
        y: 200,
        hype: 0
    };

    socket.on("move", (data) => {

        players[socket.id].x = data.x;
        players[socket.id].y = data.y;

        io.emit("players", players);
    });

    socket.on("disconnect", () => {

        delete players[socket.id];

        io.emit("players", players);

        console.log("Player disconnected:", socket.id);
    });

});

http.listen(PORT, () => {

    console.log("Server started on port", PORT);

});
