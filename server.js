const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const MAX_PLAYERS = 6;

let players = [];
let turn = 0;

const scandalCards = [
 {text:"-1 хайп", hype:-1, skip:0},
 {text:"-2 хайп", hype:-2, skip:0},
 {text:"-3 хайп", hype:-3, skip:0},
 {text:"-4 хайп", hype:-4, skip:0},
 {text:"-5 хайп", hype:-5, skip:0},
 {text:"-5 хайп, пропусти ход", hype:-5, skip:1},
 {text:"-3 хайп у всех", hype:-3, skip:0, all:true}
];

const cells = [
{type:"start"},
{type:"hype", value:2},
{type:"hype", value:3},
{type:"hype", value:4},
{type:"hype", value:5},
{type:"hype", value:8},
{type:"scandal"},
{type:"risk"},
{type:"jail"},
{type:"court"},
{type:"hype", value:2},
{type:"hype", value:3},
{type:"hype", value:4},
{type:"hype", value:5},
{type:"scandal"},
{type:"risk"},
{type:"hype", value:2},
{type:"hype", value:3},
{type:"scandal"},
{type:"court"},
{type:"hype", value:4},
{type:"hype", value:5}
];

io.on("connection", socket => {

 if(players.length >= MAX_PLAYERS){
  socket.emit("full");
  return;
 }

 const player = {
  id: socket.id,
  position:0,
  hype:0,
  skip:0,
  color: players.length
 };

 players.push(player);

 socket.emit("init", players);

 io.emit("update", players);

 socket.on("rollDice", () => {

  if(players[turn].id !== socket.id) return;

  if(player.skip > 0){
   player.skip--;
   nextTurn();
   return;
  }

  const dice = Math.floor(Math.random()*6)+1;

  player.position += dice;

  if(player.position >= cells.length)
   player.position -= cells.length;

  handleCell(player);

  io.emit("dice", {
   dice,
   players,
   text:getCellText(player)
  });

  if(player.hype >= 100){
   io.emit("win", player.color);
  }

  nextTurn();

 });

 socket.on("disconnect", () => {

  players = players.filter(p=>p.id!==socket.id);

  io.emit("update", players);

 });

});

function handleCell(player){

 const cell = cells[player.position];

 if(cell.type==="hype"){
  player.hype += cell.value;
 }

 if(cell.type==="risk"){
  const roll = Math.floor(Math.random()*6)+1;
  player.hype += roll<=3 ? -5 : 5;
 }

 if(cell.type==="jail"){
  player.hype = Math.floor(player.hype/2);
  player.skip++;
 }

 if(cell.type==="court"){
  player.skip++;
 }

 if(cell.type==="scandal"){

  const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];

  if(card.all){
   players.forEach(p=>p.hype+=card.hype);
  }else{
   player.hype+=card.hype;
  }

  player.skip+=card.skip;

 }

 if(player.hype<0) player.hype=0;

}

function getCellText(player){
 return "Хайп: "+player.hype;
}

function nextTurn(){
 turn++;
 if(turn>=players.length) turn=0;
}

http.listen(3000);
