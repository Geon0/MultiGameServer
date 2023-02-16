const app = require("express")();
const server = require("http").createServer(app);
const SocketIO = require('socket.io');
// 서버 연결, path는 프론트와 일치시켜준다.
const io = SocketIO(server,{path: '/socket.io'});
const port = 4000;

//  localhost:port번호 서버에 접속하면 클라이언트로 index.html 전송
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 소켓이 현재 연결된 방의 이름
function getUserCurrentRoom(socket) {
  const room1 = "Room_starwings";
  const room2 = "Room_norriGum";
  const room3 = "Room_dmc";

  if (socket.rooms.has("Room_starwings")) {
    return room1;
  } else if (socket.rooms.has("Room_norriGum")) {
    return room2;
  } else if (socket.rooms.has("Room_dmc")) {
    return room3;
  }
}

//namespace 지정
// const starwings = io.of('/starwings');
//
// starwings.on('connection', (socket) => {
//   console.log('starwings 네임스페이스에 접속');
//   socket.on('disconnect', () => {
//     console.log('starwings 네임스페이스 접속 해제');
//   });
// });

let monsterHp = 10000;
let count = 0;
let roomCount = 0;
let date_ob = new Date();
// 몬스터 체력 받아오기
function getMonsterHp(value) {
  if(value) monsterHp -= value
  return monsterHp
}

io.on("connection", (socket) => {
  count++
  socket.num = count
  socket.weapon = 10;
  console.log('클라이언트 접속',socket.id);
  console.log('현재 시각 : ' +date_ob);
  console.log('socket count',socket.num + ' 명 접속해 있습니다');

  socket.on("disconnect", async () => {
    console.log('클라이언트 접속 해제', socket.id);
    clearInterval(socket.interval);
  });

  socket.on('error', (error) => {
    console.error(error);
  });


  socket.on("waitRoom-message", (msg) => {
    io.emit("waitRoom-message", msg);
  });

  socket.on("req_user_name", (msg) => {
    socket.userName = msg;
  });

  socket.on("req_join_room", async (msg) => {
    roomCount++
    const value =  getMonsterHp();
    let rooms = [];
    let roomName = "Room_" + msg;
    if (!rooms.includes(roomName)) {
      rooms.push(roomName);
    }
    socket.join(roomName);
    io.to(roomName).emit(
        "noti_join_room",
        socket.userName + " 님이 " + roomName + "방에 입장하였습니다.",value
    );
  });

  socket.on("req_select_weapon", async (msg) => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    socket.weapon = msg;
    io.to(userCurrentRoom).emit("noti_weapon_change", socket.weapon,socket.userName);
  });

  socket.on('req_room_message', async(msg) => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    io.to(userCurrentRoom).emit("noti_room_message", msg);
  });

  socket.on("req_out_room", async (msg) => {
    let userCurrentRoom = getUserCurrentRoom(socket);
    socket.leave(userCurrentRoom);
    io.to(userCurrentRoom).emit("noti_out_message", msg, socket.userName);
  });

  socket.on("attack-damage", async () => {
    let userCurrentRoom = getUserCurrentRoom(socket);
   const value =  getMonsterHp(socket.weapon);
   if(value < 1 ) {
     socket.disconnect();
   }
    io.to(userCurrentRoom).emit("attack-damage", socket.userName, socket.weapon, value);
  });
});

server.listen(port, () => {
  console.log("Connected at " + port);
});
