const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const rooms = {};

const scandalCards = [
    { text: "-1 хайп", hype: -1 },
    { text: "-2 хайп", hype: -2 },
    { text: "-3 хайп", hype: -3 },
    { text: "-4 хайп", hype: -4 },
    { text: "-5 хайп", hype: -5 },
    { text: "-5 хайп, пропусти ход", hype: -5, skip: true },
    { text: "-3 хайп у всех игроков", hypeAll: -3 }
];

const cells = [
    { type:"start" },
    { type:"hype", value:3 },
    { type:"hype", value:2 },
    { type:"scandal" },
    { type:"risk" },
    { type:"hype", value:2 },
    { type:"scandal" },
    { type:"hype", value:3 },
    { type:"hype", value:5 },
    { type:"loseAll" },
    { type:"jail" },
    { type:"hype", value:3 },
    { type:"risk" },
    { type:"hype", value:3 },
    { type:"skip" },
    { type:"hype", value:2 },
    { type:"scandal" },
    { type:"hype", value:8 },
    { type:"loseAll" },
    { type:"hype", value:4 }
];

io.on("connection", socket => {

    socket.on("joinRoom", ({name, room, color}) => {

        socket.join(room);

        if(!rooms[room]){
            rooms[room] = {
                players: [],
                turn: 0
            };
        }

        const player = {
            id: socket.id,
            name,
            color,
            position: 0,
            hype: 0,
            skip: false
        };

        rooms[room].players.push(player);

        io.to(room).emit("updatePlayers", rooms[room]);
    });

    socket.on("rollDice", room => {

        const game = rooms[room];
        if(!game) return;

        const player = game.players[game.turn];
        if(player.id !== socket.id) return;

        if(player.skip){
            player.skip = false;
            nextTurn(room);
            return;
        }

        const dice = Math.floor(Math.random()*6)+1;

        player.position = (player.position + dice) % cells.length;

        let cell = cells[player.position];
        let message = "";

        if(cell.type==="hype"){
            player.hype += cell.value;
            message = "+"+cell.value+" хайп";
        }

        if(cell.type==="loseAll"){
            player.hype = 0;
            message = "Потеря всего хайпа";
        }

        if(cell.type==="skip"){
            player.skip = true;
            message = "Пропуск хода";
        }

        if(cell.type==="jail"){
            player.hype = Math.floor(player.hype/2);
            player.skip = true;
            message = "Тюрьма";
        }

        if(cell.type==="risk"){
            let r = Math.random()<0.5 ? -5 : 5;
            player.hype = Math.max(0, player.hype + r);
            message = "Риск "+r;
        }

        if(cell.type==="scandal"){

            const card = scandalCards[Math.floor(Math.random()*scandalCards.length)];

            if(card.hype){
                player.hype = Math.max(0, player.hype + card.hype);
            }

            if(card.skip){
                player.skip = true;
            }

            if(card.hypeAll){
                game.players.forEach(p=>{
                    p.hype = Math.max(0, p.hype + card.hypeAll);
                });
            }

            message = card.text;

            io.to(room).emit("scandalCard", card.text);
        }

        io.to(room).emit("diceRolled", {
            dice,
            message,
            game
        });

        if(player.hype >= 100){
            io.to(room).emit("gameOver", player.name);
            return;
        }

        nextTurn(room);
    });

    function nextTurn(room){
        const game = rooms[room];
        game.turn = (game.turn + 1) % game.players.length;
        io.to(room).emit("updatePlayers", game);
    }

});

http.listen(3000);
