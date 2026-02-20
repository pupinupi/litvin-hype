const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("client"));

let rooms = {};

const scandalCards = [
  "-1 хайп",
  "-2 хайп",
  "-3 хайп",
  "-3 хайп у всех игроков",
  "-4 хайп",
  "-5 хайп",
  "-5 хайп, пропусти ход"
];

const boardActions = [
  "start",
  "+3",
  "+2",
  "scandal",
  "risk",
  "+2",
  "scandal",
  "+3",
  "+5",
  "zero",
 
