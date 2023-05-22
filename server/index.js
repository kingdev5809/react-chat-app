const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const mongoStore = require("connect-mongo");
const expressSession = require("express-session");
const User = require("./models/userModel");

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3001",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = global.onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.broadcast.to(sendUserSocket).emit("msg-recieve", data);
    }
    console.log(sendUserSocket);
  });

  const SetOnlineUsers = {};
  socket.on("online", async function (data) {
    SetOnlineUsers[socket.id] = data.userId;
    let doc = await User.findOneAndUpdate(
      {
        _id: data.userId,
      },
      { isActive: true }
    );
    socket.broadcast.emit("set-online-user", data.userId);
  });

  socket.on("disconnect", async function () {
    const oflineUserId = SetOnlineUsers[socket.id];
    let doc = await User.findOneAndUpdate(
      {
        _id: oflineUserId,
      },
      { isActive: false }
    );
    socket.broadcast.emit("set-offline-users", oflineUserId);
  });
});
