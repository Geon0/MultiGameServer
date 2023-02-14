const app = require("express")();
const server = require("http").createServer(app);
// http server -> socket.io server 로 변경
const io = require("socket.io")(server);

// 접속에 사용할 포트 번호
const port = 4000;

//  localhost:port번호 서버에 접속하면 클라이언트로 index.html 전송
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 소켓이 현재 연결된 방의 이름
function getUserCurrentRoom(socket) {
  let rooms = socket.rooms;

  const room1 = "Room_starwings";
  const room2 = "Room_norriGum";
  const room3 = "Room_dmc";

  if (rooms.has("Room_starwings")) {
    return room1;
  } else if (rooms.has("Room_norriGum")) {
    return room2;
  } else if (rooms.has("Room_dmc")) {
    return room3;
  }
}

io.on("connection", (socket) => {
  let user_name = null;
  let weapon = 10;
  let hp = 10000;
  socket.on("waitRoom-message", (msg) => {
    io.emit("waitRoom-message", msg);
  });

  socket.on("req_user_name", (msg) => {
    user_name = msg;
  });

  socket.on("req_join_room", async (msg) => {
    let rooms = [];
    let roomName = "Room_" + msg;
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
    }
    socket.join(roomName);
    io.to(roomName).emit(
        "noti_join_room",
        user_name + " 님이 " + roomName + "방에 입장하였습니다."
    );
  });

  socket.on("disconnect", async () => {
    console.log("user disconnected");
  });

  socket.on("req_select_weapon", async (msg) => {
    weapon = msg;
  });

  socket.on('req_room_message', async(msg) => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    io.to(userCurrentRoom).emit("noti_room_message", msg);
  });

  socket.on("req_out_room", async (msg) => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    socket.leave(userCurrentRoom);
    io.to(userCurrentRoom).emit("noti_out_message", msg, user_name);
  });

  socket.on("attack-damage", async () => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    hp -= weapon;
    io.to(userCurrentRoom).emit("attack-damage", user_name, weapon, hp);
  });
});

server.listen(port, () => {
  console.log("Connected at " + port);
});
