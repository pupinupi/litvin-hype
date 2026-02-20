const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

let rooms = {};

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-3 хайп у всех игроков",
 
