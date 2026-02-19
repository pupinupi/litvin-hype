const board = document.getElementById("board");
const diceBtn = document.getElementById("rollDice");
const hypeDisplay = document.getElementById("hype");
const eventPopup = document.getElementById("event");

let position = 0;
let hype = 0;
let isMoving = false;
const totalCells = 20;

const token = document.createElement("div");
token.classList.add("player-token");
board.appendChild(token);

// ---- координаты 20 клеток ----
// порядок: снизу слева → вправо → вверх → влево → вниз
function generatePath() {
  const path = [];
  const rect = board.getBoundingClientRect();

  const padding = 40;
  const width = rect.width - padding * 2;
  const height = rect.height - padding * 2;

  const cellW = width / 5;
  const cellH = height / 5;

  // нижняя линия (5)
  for (let i = 0; i < 5; i++) {
    path.push({
      x: padding + i * cellW,
      y: rect.height - padding
    });
  }

  // правая сторона (5)
  for (let i = 1; i <= 5; i++) {
    path.push({
      x: rect.width - padding,
      y: rect.height - padding - i * cellH
    });
  }

  // верхняя линия (5)
  for (let i = 4; i >= 0; i--) {
    path.push({
      x: padding + i * cellW,
      y: padding
    });
  }

  // левая сторона (5)
  for (let i = 4; i >= 1; i--) {
    path.push({
      x: padding,
      y: padding + i * cellH
    });
  }

  return path;
}

let path = [];

window.onload = () => {
  path = generatePath();
  moveTokenInstant();
};

function moveTokenInstant() {
  token.style.left = path[position].x + "px";
  token.style.top = path[position].y + "px";
}

async function moveSteps(steps) {
  isMoving = true;

  for (let i = 0; i < steps; i++) {
    position = (position + 1) % totalCells;
    token.style.left = path[position].x + "px";
    token.style.top = path[position].y + "px";
    await new Promise(r => setTimeout(r, 300));
  }

  triggerCellEvent();
  isMoving = false;
}

function triggerCellEvent() {
  const events = [
    { text: "Гаражный пранк +2 хайпа", hype: 2 },
    { text: "СГОРЕЛО КРАСНОЕ 🔥 СКАНДАЛ -1", hype: -1, scandal: true },
    { text: "Интеграция +3 хайпа", hype: 3 },
    { text: "Вирусный ролик +5 хайпа", hype: 5 },
    { text: "Блокировка канала -3", hype: -3 },
    { text: "Риск — брось ещё раз", hype: 0 },
    { text: "Попал в топ +4", hype: 4 },
    { text: "Скандал в СМИ -2", hype: -2, scandal: true },
    { text: "YouTube проект +2", hype: 2 },
    { text: "Суд -3", hype: -3 },
  ];

  const event = events[position % events.length];

  hype += event.hype;
  if (hype < 0) hype = 0;

  hypeDisplay.innerText = hype + " хайпа";

  if (event.scandal) {
    showScandal(event.text);
  } else {
    showEvent(event.text);
  }
}

function showEvent(text) {
  eventPopup.innerHTML = `
    <div class="popup">
      <h2>${text}</h2>
      <button onclick="closePopup()">ОК</button>
    </div>
  `;
  eventPopup.style.display = "flex";
}

function showScandal(text) {
  eventPopup.innerHTML = `
    <div class="popup scandal">
      <h1>СКАНДАЛ</h1>
      <p>${text}</p>
      <button onclick="closePopup()">Закрыть</button>
    </div>
  `;
  eventPopup.style.display = "flex";
}

function closePopup() {
  eventPopup.style.display = "none";
}

diceBtn.addEventListener("click", () => {
  if (isMoving) return;

  const roll = Math.floor(Math.random() * 6) + 1;
  diceBtn.innerText = "🎲 " + roll;
  moveSteps(roll);
});
