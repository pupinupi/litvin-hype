const socket = io();

let playerName = "";
let roomName = "";
let playerPosition = 0;
let hype = 0;

const cellsCount = 20;

// ===== ЭЛЕМЕНТЫ =====
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const createBtn = document.getElementById("createRoom");
const joinBtn = document.getElementById("joinRoom");
const rollBtn = document.getElementById("rollDice");
const hypeDisplay = document.getElementById("hype");
const token = document.querySelector(".player-token");

// ===== СОЗДАНИЕ КОМНАТЫ =====
createBtn.addEventListener("click", () => {
  playerName = nameInput.value.trim();
  roomName = roomInput.value.trim();

  if (!playerName || !roomName) {
    alert("Введите имя и код комнаты");
    return;
  }

  socket.emit("joinRoom", roomName);
  startGame();
});

// ===== ВХОД В КОМНАТУ =====
joinBtn.addEventListener("click", () => {
  playerName = nameInput.value.trim();
  roomName = roomInput.value.trim();

  if (!playerName || !roomName) {
    alert("Введите имя и код комнаты");
    return;
  }

  socket.emit("joinRoom", roomName);
  startGame();
});

// ===== НАЧАТЬ ИГРУ =====
function startGame() {
  startScreen.style.display = "none";
  gameScreen.style.display = "block";
}

// ===== БРОСОК КУБИКА =====
rollBtn.addEventListener("click", () => {
  const dice = Math.floor(Math.random() * 6) + 1;
  socket.emit("rollDice", { roomName, dice });
});

// ===== ПОЛУЧЕНИЕ БРОСКА =====
socket.on("diceRolled", (dice) => {
  movePlayer(dice);
});

// ===== ДВИЖЕНИЕ ФИШКИ =====
function movePlayer(steps) {
  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep >= steps) {
      clearInterval(interval);
      applyCellEffect();
      return;
    }

    playerPosition = (playerPosition + 1) % cellsCount;
    updateTokenPosition();
    currentStep++;

  }, 300);
}

// ===== ПОЗИЦИЯ ФИШКИ =====
function updateTokenPosition() {
  const positions = getBoardPositions();
  const pos = positions[playerPosition];

  token.style.left = pos.x + "px";
  token.style.top = pos.y + "px";
}

// ===== КООРДИНАТЫ 20 КЛЕТОК =====
function getBoardPositions() {
  const board = document.getElementById("board");
  const size = board.offsetWidth;
  const margin = 30;

  return [
    {x: margin, y: size - margin}, // старт (снизу слева)
    {x: size*0.25, y: size - margin},
    {x: size*0.45, y: size - margin},
    {x: size*0.65, y: size - margin},
    {x: size - margin, y: size - margin},

    {x: size - margin, y: size*0.75},
    {x: size - margin, y: size*0.55},
    {x: size - margin, y: size*0.35},
    {x: size - margin, y: size*0.2},

    {x: size - margin, y: margin},

    {x: size*0.65, y: margin},
    {x: size*0.45, y: margin},
    {x: size*0.25, y: margin},
    {x: margin, y: margin},

    {x: margin, y: size*0.2},
    {x: margin, y: size*0.35},
    {x: margin, y: size*0.55},
    {x: margin, y: size*0.75},

    {x: margin, y: size*0.9},
    {x: margin, y: size - margin}
  ];
}

// ===== ЭФФЕКТ КЛЕТКИ =====
function applyCellEffect() {

  // пример логики
  if (playerPosition === 3) {
    showScandal();
    hype -= 1;
  } else {
    hype += 2;
  }

  hypeDisplay.textContent = hype + " хайпа";
}

// ===== СКАНДАЛ =====
function showScandal() {
  const event = document.getElementById("event");
  event.style.display = "flex";
  event.innerHTML = `
    <div class="popup scandal">
      <h1>СКАНДАЛ</h1>
      <p>-1 хайп</p>
      <button onclick="closeEvent()">ОК</button>
    </div>
  `;
}

function closeEvent() {
  document.getElementById("event").style.display = "none";
}
