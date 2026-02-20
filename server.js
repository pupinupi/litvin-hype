const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket => {

 console.log("Подключился:", socket.id);


 // ===== ВХОД В КОМНАТУ =====

 socket.on("join", (room, name, color) => {

  if (!room || !name || !color) return;

  socket.join(room);

  if (!rooms[room]) {
   rooms[room] = {
    players: [],
    turn: 0
   };
  }

  const player = {
   id: socket.id,
   name: name,
   color: color,
   pos: 0,
   hype: 0,
   skip: 0
  };

  rooms[room].players.push(player);

  socket.room = room;

  sendState(room);

 });


 // ===== БРОСОК КУБИКА =====

 socket.on("roll", () => {

  const room = socket.room;
  if (!room) return;

  const data = rooms[room];
  if (!data) return;

  const player = data.players[data.turn];

  if (!player) return;

  if (player.id !== socket.id) return;


  // пропуск хода
  if (player.skip > 0) {

   player.skip--;

   nextTurn(room);

   sendState(room);

   return;
  }


  const dice = Math.floor(Math.random() * 6) + 1;

  io.to(room).emit("dice", dice);


  player.pos += dice;

  if (player.pos >= 20)
   player.pos -= 20;


  // ===== события клетки =====

  let text = "";

  switch(player.pos){

   case 3:
   case 6:
   case 16:

    const scandals = [
     "-1 хайп",
     "-2 хайп",
     "-3 хайп",
     "-5 хайп",
     "-5 хайп и пропуск хода"
    ];

    const s = scandals[Math.floor(Math.random()*scandals.length)];

    text = "Скандал: " + s;

    if (s.includes("-1")) player.hype -= 1;
    if (s.includes("-2")) player.hype -= 2;
    if (s.includes("-3")) player.hype -= 3;
    if (s.includes("-5")) player.hype -= 5;
    if (s.includes("пропуск")) player.skip = 1;

    io.to(room).emit("scandal", s);

    break;


   case 4:
   case 12:

    text = "Риск: +5 хайпа";

    player.hype += 5;

    break;


   case 9:
   case 18:

    text = "Весь хайп потерян";

    player.hype = 0;

    break;


   case 10:

    text = "Тюрьма: -50% хайпа и пропуск";

    player.hype = Math.floor(player.hype / 2);
    player.skip = 1;

    break;


   case 14:

    text = "Пропуск хода";

    player.skip = 1;

    break;


   default:

    const gain = Math.floor(Math.random()*5)+1;

    player.hype += gain;

    text = "+" + gain + " хайпа";

  }


  io.to(room).emit("event", text);


  // победа

  if (player.hype >= 100) {

   io.to(room).emit("event", player.name + " победил!");

  }


  nextTurn(room);

  sendState(room);

 });



 // ===== выход =====

 socket.on("disconnect", ()=>{

  const room = socket.room;

  if (!room) return;

  const data = rooms[room];

  if (!data) return;

  data.players = data.players.filter(p=>p.id!==socket.id);

  sendState(room);

 });

});



function nextTurn(room){

 const data = rooms[room];

 if (data.players.length === 0) return;

 data.turn++;

 if (data.turn >= data.players.length)
  data.turn = 0;
}



function sendState(room){

 const data = rooms[room];

 io.to(room).emit("state",{
  players:data.players,
  turn:data.players[data.turn]?.id
 });

}



http.listen(3000,()=>{
 console.log("Сервер запущен");
});
