const player = document.getElementById("player");

let position = 0;

// координаты клеток по порядку (по часовой стрелке)
const cells = [

  // НИЗ слева → вправо
  {x: 80, y: 520},
  {x: 180, y: 520},
  {x: 280, y: 520},
  {x: 380, y: 520},
  {x: 480, y: 520},
  {x: 580, y: 520},
  {x: 680, y: 520},

  // ПРАВО снизу → вверх
  {x: 720, y: 460},
  {x: 720, y: 360},
  {x: 720, y: 260},
  {x: 720, y: 160},

  // ВЕРХ справа → влево
  {x: 680, y: 80},
  {x: 580, y: 80},
  {x: 480, y: 80},
  {x: 380, y: 80},
  {x: 280, y: 80},
  {x: 180, y: 80},
  {x: 80, y: 80},

  // ЛЕВО сверху → вниз
  {x: 40, y: 160},
  {x: 40, y: 260},
  {x: 40, y: 360},
  {x: 40, y: 460}

];

function rollDice() {

  const dice = Math.floor(Math.random() * 6) + 1;

  alert("🎲 Выпало: " + dice);

  position += dice;

  if (position >= cells.length) {
    position = position - cells.length;
  }

  movePlayer();
}

function movePlayer() {

  const cell = cells[position];

  player.style.left = cell.x + "px";
  player.style.top = cell.y + "px";

}

// стартовая позиция
movePlayer();
