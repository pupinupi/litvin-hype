// подключение к серверу
const socket = io();

// элементы
const loginScreen = document.getElementById("loginScreen");
const gameScreen = document.getElementById("gameScreen");

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const colorInput = document.getElementById("colorInput");

const joinBtn = document.getElementById("joinBtn");
const rollBtn = document.getElementById("rollBtn");

const board = document.getElementById("board");
const dice = document.getElementById("dice");
const playersList = document.getElementById("playersList");
const hypeList = document.getElementById("hypeList");
const messageBox = document.getElementById("message");

let myId = null;
let myTurn = false;
let players = {};
let cells = [];


// координаты клеток (по твоему полю)
function initCells() {

    const rect = board.getBoundingClientRect();

    const w = rect.width;
    const h = rect.height;

    const margin = 60;

    cells = [

        {x: margin, y: h - margin}, // старт

        {x: margin, y: h*0.75},
        {x: margin, y: h*0.55},
        {x: margin, y: h*0.35},
        {x: margin, y: h*0.15},

        {x: w*0.25, y: margin},
        {x: w*0.45, y: margin},
        {x: w*0.65, y: margin},
        {x: w*0.85, y: margin},

        {x: w - margin, y: h*0.25},
        {x: w - margin, y: h*0.45},
        {x: w - margin, y: h*0.65},
        {x: w - margin, y: h*0.85},

        {x: w*0.75, y: h - margin},
        {x: w*0.55, y: h - margin},
        {x: w*0.35, y: h - margin},
        {x: w*0.15, y: h - margin},

        {x: w*0.25, y: h*0.85},
        {x: w*0.45, y: h*0.85},
        {x: w*0.65, y: h*0.85},

    ];
}


// вход
joinBtn.onclick = () => {

    const name = nameInput.value.trim();
    const room = roomInput.value.trim();
    const color = colorInput.value;

    if (!name || !room) {
        alert("Введите имя и комнату");
        return;
    }

    socket.emit("join", { name, room, color });
};


// успешный вход
socket.on("joined", (data) => {

    myId = data.id;

    loginScreen.style.display = "none";
    gameScreen.style.display = "block";

    setTimeout(initCells, 300);
});


// обновление игроков
socket.on("state", (data) => {

    players = data.players;
    updatePlayers();
    updateHype();
    drawPlayers();
});


// ход
socket.on("yourTurn", () => {

    myTurn = true;
    messageBox.innerText = "Твой ход";
});


// сообщение
socket.on("message", (text) => {

    messageBox.innerText = text;
});


// победа
socket.on("win", (name) => {

    alert("Победил: " + name);
});


// бросок кубика
rollBtn.onclick = () => {

    if (!myTurn) return;

    dice.classList.add("roll");

    setTimeout(() => {

        socket.emit("roll");

    }, 500);

    setTimeout(() => {

        dice.classList.remove("roll");

    }, 800);
};


// показать значение кубика
socket.on("dice", (value) => {

    dice.innerText = value;
    myTurn = false;
});


// обновить список игроков
function updatePlayers() {

    playersList.innerHTML = "";

    for (let id in players) {

        const p = players[id];

        const div = document.createElement("div");

        div.innerHTML =
            `<span style="color:${p.color}">⬤</span> ${p.name}`;

        playersList.appendChild(div);
    }
}


// обновить хайп
function updateHype() {

    hypeList.innerHTML = "";

    for (let id in players) {

        const p = players[id];

        const div = document.createElement("div");

        div.innerHTML =
            `<span style="color:${p.color}">⬤</span> ${p.name}: ${p.hype}`;

        hypeList.appendChild(div);
    }
}


// нарисовать фишки
function drawPlayers() {

    document.querySelectorAll(".token").forEach(e => e.remove());

    let offset = {};

    for (let id in players) {

        const p = players[id];

        const pos = cells[p.position];

        if (!pos) continue;

        if (!offset[p.position]) offset[p.position] = 0;

        const token = document.createElement("div");

        token.className = "token";

        token.style.background = p.color;

        token.style.left = pos.x + offset[p.position] + "px";
        token.style.top = pos.y + offset[p.position] + "px";

        offset[p.position] += 12;

        board.appendChild(token);
    }
}


// адаптация при изменении размера
window.onresize = () => {

    initCells();
    drawPlayers();
};
