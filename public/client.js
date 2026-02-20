const socket = io();

let calibrationMode = true;
let cells = [];

const board = document.getElementById("board");
const tokens = document.getElementById("tokens");

if(calibrationMode){

alert("Режим калибровки.\nНажми по очереди на все 20 клеток начиная со СТАРТ и далее по часовой стрелке.");

board.onclick = function(e){

const rect = board.getBoundingClientRect();

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

cells.push({x,y});

drawCalibrationPoint(x,y,cells.length);

if(cells.length===20){

console.log("ГОТОВЫЕ КООРДИНАТЫ:");
console.log(JSON.stringify(cells,null,2));

alert("Готово. Теперь пришли мне координаты из консоли.");

}

};

}

function drawCalibrationPoint(x,y,num){

const el = document.createElement("div");

el.style.position="absolute";
el.style.left=x+"px";
el.style.top=y+"px";
el.style.width="20px";
el.style.height="20px";
el.style.background="red";
el.style.borderRadius="50%";

el.innerHTML=num;

tokens.appendChild(el);

}
