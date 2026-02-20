const express = require("express");
const app = express();

const http = require("http").createServer(app);

const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};

io.on("connection", socket=>{

 console.log("connected",socket.id);


 socket.on("join",(room,name,color)=>{

  console.log("join",room,name,color);

  socket.join(room);

  if(!rooms[room])
   rooms[room]={players:[],turn:0};

  rooms[room].players.push({

   id:socket.id,
   name:name,
   color:color,
   pos:0,
   hype:0,
   skip:0

  });

  socket.room=room;

  sendState(room);

 });


 socket.on("roll",()=>{

  const room=socket.room;

  if(!room)return;

  const data=rooms[room];

  const player=data.players[data.turn];

  if(player.id!==socket.id)return;

  const dice=Math.floor(Math.random()*6)+1;

  io.to(room).emit("dice",dice);

  player.pos=(player.pos+dice)%20;

  player.hype+=dice;

  io.to(room).emit("event","+ "+dice+" хайпа");

  data.turn++;

  if(data.turn>=data.players.length)
   data.turn=0;

  sendState(room);

 });


});


function sendState(room){

 io.to(room).emit("state",rooms[room]);

}


http.listen(3000,()=>{

 console.log("server started");

});
