let players = [];
let currentPlayer = 0;
let gameStarted = false;

const emojis = ["🚗", "🔥", "💎", "🚀"];

function addPlayer() {
  const name = document.getElementById("playerName").value;
  if (!name) return;

  players.push({
    name,
    position: 0,
    emoji: emojis[players.length % emojis.length],
    hype: 0
  });

  renderPlayers();
}

function renderPlayers() {
  const div = document.getElementById("players");
  div.innerHTML = "";

  players.forEach(p => {
    div.innerHTML += `<div>${p.emoji} ${p.name}</div>`;
  });
}

function startGame() {
  if (players.length === 0) return;

  gameStarted = true;
  createBoard();
  updateTurn();
}

function createBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let i = 0; i < 25; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = "cell-" + i;
    board.appendChild(cell);
  }

  renderTokens();
}

function renderTokens() {
  players.forEach((p, index) => {
    const cell = document.getElementById("cell-" + p.position);

    const token = document.createElement("div");
    token.className = "player";
    token.innerText = p.emoji;

    token.style.left = (index * 10) + "px";
    token.style.top = (index * 10) + "px";

    cell.appendChild(token);
  });
}

function rollDice() {
  if (!gameStarted) return;

  const dice = Math.floor(Math.random() * 6) + 1;
  const player = players[currentPlayer];

  player.position += dice;
  if (player.position >= 24) player.position = 24;

  player.hype += dice * 5;

  updateHype(player.hype);

  clearBoard();
  renderTokens();

  currentPlayer = (currentPlayer + 1) % players.length;
  updateTurn();
}

function clearBoard() {
  for (let i = 0; i < 25; i++) {
    document.getElementById("cell-" + i).innerHTML = "";
  }
}

function updateTurn() {
  document.getElementById("turnText").innerText =
    "Ход: " + players[currentPlayer].name;
}

function updateHype(value) {
  document.getElementById("hypeFill").style.width = value + "%";
}
