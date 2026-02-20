const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// указываем папку client как публичную
app.use(express.static(path.resolve(__dirname, "client")));

// если что-то не найдено — всегда отправляем index.html
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "index.html"));
});

server.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
