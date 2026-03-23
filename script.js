let pos = 0;
let hype = 0;
let skip = false;
let emoji = "";

/* клетки */
const cells = [
  "start","+3","+2","scandal","risk","+2","scandal","+3","+5",
  "block","skip","+3","risk","+3","skip","+2","scandal","+8","block","+4"
];

/* координаты */
const coords = [
 {x:20,y:260},{x:70,y:260},{x:120,y:260},{x:170,y:260},{x:220,y:260},{x:270,y:260},
 {x:270,y:210},{x:270,y:160},{x:270,y:110},{x:270,y:60},
 {x:220,y:60},{x:170,y:60},{x:120,y:60},{x:70,y:60},{x:20,y:60},
 {x:20,y:110},{x:20,y:160},{x:20,y:210},{x:70,y:210},{x:120,y:210}
];

/* выбор */
function selectEmoji(el){
 document.querySelectorAll("#emojiSelect span").forEach(e=>e.classList.remove("selected"));
 el.classList.add("selected");
 emoji = el.innerText;
}

function showRules(){
 if(!emoji || !name.value) return alert("Заполни всё");
 document.getElementById("rules").style.display="flex";
}

function startGame(){
 lobby.style.display="none";
 rules.style.display="none";
 game.style.display="block";

 player.innerText = emoji;
 render();
}

function rollDice(){
 if(skip){
  alert("Пропуск хода");
  skip=false;
  return;
 }

 let dice = Math.floor(Math.random()*6)+1;
 move(dice);
}

/* плавное движение */
async function move(steps){
 for(let i=0;i<steps;i++){
  pos++;
  if(pos>=cells.length) pos=cells.length-1;
  render();
  await new Promise(r=>setTimeout(r,300));
 }
 applyCell();
}

/* логика клетки */
function applyCell(){
 let c = cells[pos];

 if(c==="+3") addHype(3);
 if(c==="+2") addHype(2);
 if(c==="+4") addHype(4);
 if(c==="+5") addHype(5);
 if(c==="+8") addHype(8);

 if(c==="block") addHype(-10);

 if(c==="skip"){
  addHype(-8);
  skip=true;
 }

 if(c==="risk") showRisk();
 if(c==="scandal") showScandal();

 checkWin();
}

/* хайп */
function addHype(val){
 hype += val;
 if(hype<0) hype=0;

 hypeFill.style.width = (hype/70*100)+"%";
 hypeText.innerText = "Хайп: "+hype+" / 70";

 document.body.style.boxShadow = val>0 ? "0 0 20px green" : "0 0 20px red";
 setTimeout(()=>document.body.style.boxShadow="none",300);
}

/* скандал */
function showScandal(){
 let cards = [
 ["перегрел аудиторию🔥",-1],
 ["громкий заголовок🫣",-2],
 ["это монтаж 😱",-3],
 ["меня взломали #️⃣",-3],
 ["подписчики в шоке 😮",-4],
 ["удаляй пока не поздно🤫",-5],
 ["это контент🙄",-5]
 ];

 let c = cards[Math.floor(Math.random()*cards.length)];

 eventModal.innerHTML = `
 <div class="modalBox">
   <h2 style="color:red;">СКАНДАЛ</h2>
   <p>${c[0]}</p>
   <button onclick="closeModal(${c[1]})">OK</button>
 </div>`;
 eventModal.style.display="flex";
}

/* риск */
function showRisk(){
 eventModal.innerHTML = `
 <div class="modalBox">
   <h2>Риск</h2>
   <p>1-3: -5 хайп<br>4-6: +5 хайп</p>
   <button onclick="riskRoll()">Бросить</button>
 </div>`;
 eventModal.style.display="flex";
}

function riskRoll(){
 let d = Math.floor(Math.random()*6)+1;
 let val = d<=3 ? -5 : 5;
 closeModal(val);
}

/* закрыть */
function closeModal(val){
 eventModal.style.display="none";
 addHype(val);
}

/* победа */
function checkWin(){
 if(hype>=70){
  alert("ПОБЕДА!");
 }
}

/* отрисовка */
function render(){
 let c = coords[pos];
 player.style.left = c.x+"px";
 player.style.top = c.y+"px";
}
