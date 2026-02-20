const socket = io();

let room = "";
let myId = "";
let selectedColor = null;
let positions = [];

const board = document.getElementById("board");
const boardImg = document.querySelector(".board-img");

// ===== ВЫБОР ФИШКИ =====
document.querySelectorAll(".choice").forEach(el => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".choice").forEach(c => c.style.boxShadow = "none");
    el.style.boxShadow = "0 0 15px white";
    selectedColor = el.dataset.color;
  });
});

// ===== ВХОД В КОМНАТУ =====
function enter() {

  const name = document.getElementById("name").value;
  room = document.getElementById("room").value;

  if (!name || !room) {
    alert("Введите имя и код комнаты");
    return;
  }

  if (!selectedColor) {
    alert("Выберите фишку");
    return;
  }

  socket.emit("joinRoom", {
    name,
    room,
    color: selectedColor
  });

  document.getElementById("start").style.display = "none";
  document.getElementById("game").style.display = "block";
}

// ===== ПОСТРОЕНИЕ 20 КЛЕТОК ПО ПЕРИМЕТРУ =====
boardImg.onload = () => {

  const size = board.offsetWidth;
  const margin = size * 0.08;
  const step = (size - margin * 2) / 4;

  positions = [];

  // 1) Вверх (5 клеток)
  for (let i = 0; i < 5; i++) {
    positions.push({
      x: margin,
      y: size - margin - i * step
    });
  }

  // 2) Вправо (4 клетки)
  for (let i = 1; i < 5; i++) {
    positions.push({
      x: margin + i * step,
      y: margin
    });
  }

  // 3) Вниз (5 клеток)
  for (let i = 4; i >= 0; i--) {
    positions.push({
      x: size - margin,
      y: margin + (4 - i) * step
    });
  }

  // 4) Влево (4 клетки)
  for (let i = 4; i > 0; i--) {
    positions.push({
      x: margin + (i - 1) * step,
      y: size - margin
    });
  }
};

// ===== БРОСОК =====
function roll() {
  socket.emit("rollDice", room);
}

// ===== ОБНОВЛЕНИЕ =====
socket.on("update", data => {
  myId = socket.id;
  render(data.players);
});

socket.on("dice", data => {
  render(data.players);
});

socket.on("scandal", text => {
  const popup = document.getElementById("popup");
  popup.innerHTML = "СКАНДАЛ<br>" + text;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2500);
});

socket.on("winner", name => {
  alert("🔥 Победил " + name);
});

// ===== ОТРИСОВКА ФИШЕК =====
function render(players) {

  board.querySelectorAll(".token").forEach(t => t.remove());

  players.forEach((p, index) => {

    if (!positions[p.position]) return;

    const token = document.createElement("div");
    token.className = "token";
    token.style.background = p.color;

    token.style.left = positions[p.position].x + "px";
    token.style.top = positions[p.position].y + "px";

    // если несколько игроков на клетке — раздвигаем
    token.style.transform = `translate(-50%, -50%) translate(${index * 6}px, ${index * 6}px)`;

    board.appendChild(token);
  });

  document.getElementById("info").innerHTML =
    players.map(p => `${p.name}: ${p.hype} хайпа`).join("<br>");
}
