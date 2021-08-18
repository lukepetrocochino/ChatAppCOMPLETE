const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, getUser, removeUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 8000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// On Connection event:

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    console.log("User has connected");
    // The addUser function can only return two possible things, a user object, or an error.
    // addUser receives id, name and room.
    const { error, user } = addUser({ id: socket.id, name, room });

    // Error message is displayed dynamically based on the specific error
    // If there is an error, the rest of the function will not be run, due to the return statement
    if (error) return callback(error);

    // Sends message to the current user only
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    // Broadcast sends a message to everyone EXCEPT the given user.
    socket.broadcast.to(user.room).emit("message", {
      user: "admin",
      text: `${user.name}, has joined the chat`,
    });

    socket.join(user.room);

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // On user generated message event:

  // (Admin messages are "message", user generated messages are "sendMessage")
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.room).emit("roomData", {
      user: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log("User has disconnected.");

    if (user) {
      io.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left.`,
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
