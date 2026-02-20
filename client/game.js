const socket = io();

let room;
let color = "red";
let myId;

const positions = [];
let boardSize = 0;

const board = document.getElementById("board");
const boardImg = document.querySelector(".board-img");

// ====== СТРОИМ КООРДИНАТЫ ПОСЛЕ ЗАГРУЗКИ КАРТИНКИ ======
boardImg.onload = () => {

  boardSize = board.offsetWidth;

  const margin = boardSize * 0.07;   // отступ от края
  const step = (boardSize - margin * 2) / 4;

  positions.length = 0;

  // 1) ВВЕРХ (5 клеток)
  for (let i = 0; i < 5; i++) {
    positions.push({
      x: margin,
      y: boardSize - margin - i * step
    });
  }

  // 2) ВПРАВО (4 клетки)
  for (let i = 1; i < 5; i++) {
    positions.push({
      x: margin + i * step,
      y: margin
    });
  }

  // 3) ВНИЗ (5 клеток)
  for (let i = 4; i >= 0; i--) {
    positions.push({
      x: boardSize - margin,
      y: margin + (4 - i) * step
    });
  }

  // 4) ВЛЕВО (4 клетки)
  for (let i = 4; i > 0; i--) {
    positions.push({
      x: margin + (i - 1) * step,
      y: boardSize - margin
    });
  }
};

// ===== ВЫБОР ФИШКИ =====
document.querySelectorAll(".choice").forEach(el => {
  el.onclick = () => {
    color = el.dataset.color;
  };
});

// ===== ВХОД =====
function enter() {
  const name = document.getElementById("name").value;
  room = document.getElementById("room").value;

  if (!name || !room) return alert("Введите имя и комнату");

  socket.emit("joinRoom", { room, name, color });

  document.getElementById("start").style.display = "none";
  document.getElementById("game").style.display = "block";
}

// ===== БРОСОК =====
function roll() {
  socket.emit("rollDice", room);
}

// ===== СОБЫТИЯ =====
socket.on("update", data => {
  myId = socket.id;
  render(data.players);
});

socket.on("dice", ({ data }) => {
  render(data.players);
});

socket.on("scandal", card => {
  document.getElementById("popup").innerHTML =
    `<div style="font-size:24px;">СКАНДАЛ<br>${card}</div>`;

  setTimeout(() =>
    document.getElementById("popup").innerHTML = "",
    2500
  );
});

socket.on("winner", name => {
  alert("🔥 Победил " + name);
});

// ===== РЕНДЕР =====
function render(players) {

  board.querySelectorAll(".token").forEach(t => t.remove());

  players.forEach(p => {

    if (!positions[p.position]) return;

    const token = document.createElement("div");
    token.className = "token";
    token.style.background = p.color;
    token.style.left = positions[p.position].x + "px";
    token.style.top = positions[p.position].y + "px";

    if (p.id === myId)
      token.style.boxShadow = "0 0 20px white";

    board.appendChild(token);
  });

  document.getElementById("info").innerHTML =
    players.map(p =>
      `${p.name}: ${p.hype} хайпа`
    ).join("<br>");
}
