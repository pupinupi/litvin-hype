let positions = [0, 0, 0, 0];
let current = 0;
let hype = 0;

/* ТОЧНЫЕ координаты под твоё поле */
const cells = [
  {x:20,y:260},{x:80,y:260},{x:140,y:260},{x:200,y:260},{x:260,y:260},
  {x:260,y:200},{x:260,y:150},{x:260,y:100},{x:260,y:50},
  {x:200,y:50},{x:140,y:50},{x:80,y:50},{x:20,y:50},
  {x:20,y:100},{x:20,y:150},{x:20,y:200}
];

/* старт игры */
function startGame() {
  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  updateTurn();
  render();
}

/* движение */
function rollDice() {
  let dice = Math.floor(Math.random() * 6) + 1;

  positions[current] += dice;

  if (positions[current] >= cells.length) {
    positions[current] = cells.length - 1;
  }

  hype += dice * 5;
  document.getElementById("hypeFill").style.width = hype + "%";

  current = (current + 1) % 4;

  updateTurn();
  render();
}

/* отрисовка */
function render() {
  positions.forEach((pos, i) => {
    const el = document.getElementById("p" + i);
    const cell = cells[pos];

    el.style.left = (cell.x + i * 8) + "px";
    el.style.top = (cell.y + i * 8) + "px";
  });
}

/* чей ход */
function updateTurn() {
  document.getElementById("turn").innerText =
    "Ход игрока " + (current + 1);
}
