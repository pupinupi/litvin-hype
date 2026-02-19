const socket = io();
let room;
let myId;

const positions = [];
const board = document.getElementById("board");

function generatePath() {
  const size = board.offsetWidth;
  const m = 30;

  for (let i = 0; i < 5; i++)
    positions.push({ x: m + i*(size-2*m)/4, y: size - m });

  for (let i = 1; i < 5; i++)
    positions.push({ x: size - m, y: size - m - i*(size-2*m)/4 });

  for (let i = 4; i >= 0; i--)
    positions.push({ x: m + i*(size-2*m)/4, y: m });

  for (let i = 4; i > 0; i--)
    positions.push({ x: m, y: m + i*(size-2*m)/4 });
}

window.onload = generatePath;

function enter() {
  const name = document.getElementById("name").value;
  room = document.getElementById("room").value;

  if (!name || !room) return alert("Введите имя и код");

  socket.emit("joinRoom", { room, name });

  document.getElementById("start").style.display = "none";
  document.getElementById("game").style.display = "block";
}

function roll() {
  socket.emit("rollDice", room);
}

socket.on("update", data => {
  render(data.players);
});

socket.on("dice", ({ dice, data }) => {
  render(data.players);
});

socket.on("scandal", card => {
  const p = document.getElementById("popup");
  p.innerHTML = `<div class="pop red">СКАНДАЛ<br>${card}</div>`;
  setTimeout(()=>p.innerHTML="",2000);
});

socket.on("winner", name => {
  alert("🔥 Победил " + name);
});

function render(players) {
  board.innerHTML = "";
  players.forEach(p => {
    const t = document.createElement("div");
    t.className = "token";
    t.style.left = positions[p.position].x + "px";
    t.style.top = positions[p.position].y + "px";
    board.appendChild(t);
  });

  const info = document.getElementById("info");
  info.innerHTML = players.map(p =>
    `${p.name} — ${p.hype} хайпа`
  ).join("<br>");
}
