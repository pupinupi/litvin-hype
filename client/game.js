const socket = io();

let room;
let selectedColor = "red";
let myId;

const board = document.getElementById("board");
const popup = document.getElementById("popup");

const positions = [];
const cells = 20;

// ====== СОЗДАНИЕ ПУТИ ======
function generatePath() {
  const size = board.offsetWidth;
  const m = 40;
  const step = (size - 2*m) / 4;

  // низ →
  for (let i = 0; i < 5; i++)
    positions.push({ x: m + i*step, y: size - m });

  // вправо ↑
  for (let i = 1; i < 5; i++)
    positions.push({ x: size - m, y: size - m - i*step });

  // верх ←
  for (let i = 4; i >= 0; i--)
    positions.push({ x: m + i*step, y: m });

  // влево ↓
  for (let i = 4; i > 0; i--)
    positions.push({ x: m, y: m + i*step });
}

window.onload = () => {
  setTimeout(generatePath, 300);
};

// ====== ВЫБОР ФИШКИ ======
document.querySelectorAll(".token-choice").forEach(el=>{
  el.onclick = () => {
    document.querySelectorAll(".token-choice").forEach(e=>e.style.border="none");
    el.style.border="4px solid white";
    selectedColor = el.dataset.color;
  }
});

// ====== ВХОД ======
function enter() {
  const name = document.getElementById("name").value;
  room = document.getElementById("room").value;

  if (!name || !room) return alert("Введите имя и код");

  socket.emit("joinRoom", { room, name, color:selectedColor });

  document.getElementById("start").style.display = "none";
  document.getElementById("game").style.display = "block";
}

// ====== КУБИК ======
function roll() {
  const dice = document.getElementById("dice");
  dice.style.transform = "rotate(360deg)";
  setTimeout(()=>dice.style.transform="rotate(0deg)",500);
  socket.emit("rollDice", room);
}

// ====== СОБЫТИЯ ======
socket.on("update", data => {
  myId = socket.id;
  render(data.players);
});

socket.on("dice", ({ dice, data }) => {
  document.getElementById("diceResult").innerText = "Выпало: " + dice;
  render(data.players);
});

socket.on("scandal", card => {
  popup.innerHTML = `
    <div class="pop red">
      <h2>СКАНДАЛ</h2>
      <p>${card}</p>
    </div>
  `;
  setTimeout(()=>popup.innerHTML="",2500);
});

socket.on("winner", name => {
  alert("🔥 Победил " + name);
});

// ====== РЕНДЕР ======
function render(players) {
  board.querySelectorAll(".token").forEach(t=>t.remove());

  players.forEach(p=>{
    const t = document.createElement("div");
    t.className = "token";
    t.style.background = p.color || "red";

    const pos = positions[p.position];
    if(!pos) return;

    t.style.left = pos.x + "px";
    t.style.top = pos.y + "px";

    if(p.id === myId)
      t.style.boxShadow="0 0 20px white";

    board.appendChild(t);
  });

  const info = document.getElementById("info");
  info.innerHTML = players.map(p =>
    `<div>${p.name}: ${p.hype} хайпа</div>`
  ).join("");
}
