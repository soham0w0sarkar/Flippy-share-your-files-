import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

config({
  path: "./config/config.env",
});

const io = new Server(server);

app.use(express.static("./public"));

io.on("connection", function (socket) {
  console.log("Connection started.........");

  socket.on("sender-join", function (data) {
    console.log("Sender Joined.........");
    socket.join(data.uid);
  });
  socket.on("receiver-join", function (data) {
    console.log("Receiver Joined.........");
    socket.join(data.uid);
    socket.in(data.sender_uid).emit("init", data.uid);
  });
  socket.on("file-meta", function (data) {
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });
  socket.on("fs-start", function (data) {
    socket.in(data.uid).emit("fs-share", {});
  });
  socket.on("file-raw", function (data) {
    socket.in(data.uid).emit("fs-share", data.buffer);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on PORT : ${process.env.PORT}........`);
});
