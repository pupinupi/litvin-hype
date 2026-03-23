let positions = [0, 0, 0, 0];
let current = 0;

// координаты клеток (пример, под твоё поле)
const cells = [
  {x:20,y:250},{x:80,y:250},{x:140,y:250},{x:200,y:250},{x:260,y:250},
  {x:260,y:200},{x:260,y:150},{x:260,y:100},{x:260,y:50},
  {x:200,y:50},{x:140,y:50},{x:80,y:50},{x:20,y:50},
  {x:20,y:100},{x:20,y:150},{x:20,y:200}
];

function render() {
  positions.forEach((pos, i) => {
    const el = document.getElementById("p"+i);
    const cell = cells[pos];

    el.style.left = (cell.x + i*8) + "px";
    el.style.top = (cell.y + i*8) + "px";
  });
}

function rollDice() {
  let dice = Math.floor(Math.random()*6)+1;

  positions[current] += dice;
  if (positions[current] >= cells.length) {
    positions[current] = cells.length - 1;
  }

  document.getElementById("info").innerText =
    "Игрок " + (current+1) + " выбросил " + dice;

  current = (current + 1) % 4;

  render();
}

render();
