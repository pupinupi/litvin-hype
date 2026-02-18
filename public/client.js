const socket = io();

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 500;

let players = {};

canvas.addEventListener("mousemove", (e) => {

    socket.emit("move", {

        x: e.offsetX,
        y: e.offsetY

    });

});

socket.on("players", (serverPlayers) => {

    players = serverPlayers;

});

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {

        let p = players[id];

        ctx.fillStyle = "cyan";

        ctx.beginPath();
        ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
        ctx.fill();

    }

    requestAnimationFrame(draw);
}

draw();
