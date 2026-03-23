let position = 0;
let selectedEmoji = null;
let playerName = "";
let hype = 0;

/* координаты клеток */
const cells = [
  {x:20,y:260},{x:80,y:260},{x:140,y:260},{x:200,y:260},{x:260,y:260},
  {x:260,y:200},{x:260,y:150},{x:260,y:100},{x:260,y:50},
  {x:200,y:50},{x:140,y:50},{x:80,y:50},{x:20,y:50},
  {x:20,y:100},{x:20,y:150},{x:20,y:200}
];

/* выбор фишки */
function selectEmoji(el) {
  document.querySelectorAll("#emojiSelect span").forEach(e => {
    e.classList.remove("selected");
  });

  el.classList.add("selected");
  selectedEmoji = el.innerText;
}

/* старт */
function startGame() {
  playerName = document.getElementById("name").value;

  if (!playerName) {
    alert("Введи имя");
    return;
  }

  if (!selectedEmoji) {
    alert("Выбери фишку");
    return;
  }

  document.getElementById("lobby").style.display = "none";
  document.getElementById("game").style.display = "block";

  document.getElementById("player").innerText = selectedEmoji;

  render();
}

/* бросок кубика */
function rollDice() {
  let dice = Math.floor(Math.random() * 6) + 1;

  position += dice;

  if (position >= cells.length) {
    position = cells.length - 1;
  }

  hype += dice * 5;
  document.getElementById("hypeFill").style.width = hype + "%";

  render();
}

/* отрисовка */
function render() {
  const cell = cells[position];
  const el = document.getElementById("player");

  el.style.left = cell.x + "px";
  el.style.top = cell.y + "px";
}
