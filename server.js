const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

const scandalCards = [
    { text: "-1 хайп", type: "minus", value: 1 },
    { text: "-2 хайп", type: "minus", value: 2 },
    { text: "-3 хайп у всех", type: "minusAll", value: 3 },
    { text: "-3 хайп", type: "minus", value: 3 },
    { text: "-4 хайп", type: "minus", value: 4 },
    { text: "-5 хайп и пропуск хода", type: "minusSkip", value: 5 },
    { text: "-5 хайп", type: "minus", value: 5 }
];

const cells = [
    {type:"start"},
    {type:"plus", value:3},
    {type:"plus", value:2},
    {type:"scandal"},
    {type:"risk"},
    {type:"plus", value:2},
    {type:"scandal"},
    {type:"plus", value:3},
    {type:"plus", value:5},
    {type:"reset"},
    {type:"jail"},
    {type:"plus", value:3},
    {type:"risk"},
    {type:"plus", value:3},
    {type:"skip"},
    {type:"plus", value:2},
    {type:"scandal"},
    {type:"plus", value:8},
    {type:"reset"},
    {type:"plus", value:4}
];

io.on("connection", socket => {

    socket.on("createRoom", ({name,color}) => {

        const room = Math.random().toString(36).substr(2,5).toUpperCase();

        rooms[room] = {
            players:{},
            turn:0,
            order:[]
        };

        joinRoom(socket,room,name,color);
        socket.emit("roomCreated", room);

    });

    socket.on("joinRoom", ({room,name,color}) => {

        if(!rooms[room]){
            socket.emit("errorMessage","Комната не существует");
            return;
        }

        joinRoom(socket,room,name,color);

    });

    socket.on("rollDice", () => {

        const room = socket.room;
        const game = rooms[room];

        if(!game) return;

        if(game.order[game.turn] !== socket.id) return;

        const player = game.players[socket.id];

        const dice = Math.floor(Math.random()*6)+1;

        player.position += dice;

        if(player.position >= cells.length)
            player.position %= cells.length;

        let hypeGain = 0;

        const cell = cells[player.position];

        if(cell.type==="plus"){
            hypeGain += cell.value;
        }

        if(cell.type==="risk"){
            const r = Math.random()<0.5 ? -5 : 5;
            hypeGain += r;
        }

        if(cell.type==="reset"){
            player.hype = 0;
        }

        if(cell.type==="jail"){
            player.hype = Math.floor(player.hype/2);
            player.skip = true;
        }

        if(cell.type==="skip"){
            player.skip = true;
        }

        if(cell.type==="scandal"){
            const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];
            socket.emit("scandalCard",card);

            if(card.type==="minus"){
                player.hype -= card.value;
            }

            if(card.type==="minusSkip"){
                player.hype -= card.value;
                player.skip=true;
            }

            if(card.type==="minusAll"){
                for(let id in game.players){
                    game.players[id].hype -= card.value;
                }
            }
        }

        player.hype += hypeGain;

        if(player.hype < 0) player.hype = 0;

        if(player.hype >= 100){
            io.to(room).emit("win",player.name);
        }

        nextTurn(game);

        io.to(room).emit("update",game.players);
        io.to(room).emit("dice",dice);

    });

});


function joinRoom(socket,room,name,color){

    socket.join(room);

    socket.room=room;

    const game = rooms[room];

    game.players[socket.id]={
        id:socket.id,
        name,
        color,
        position:0,
        hype:0,
        skip:false
    };

    game.order.push(socket.id);

    io.to(room).emit("update",game.players);

}


function nextTurn(game){

    do{
        game.turn++;
        if(game.turn>=game.order.length)
            game.turn=0;

        const player = game.players[game.order[game.turn]];

        if(player.skip){
            player.skip=false;
            continue;
        }

        break;

    }while(true);

}

server.listen(3000,()=>{
    console.log("Server running");
});
