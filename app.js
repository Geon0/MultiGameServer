const app = require("express")();
const server = require("http").createServer(app);
const SocketIO = require('socket.io');
const Console = require("console");
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

let count = 0;// 몬스터 체력 받아오기
let monsterHp = 10000;
function getMonsterHp(value) {
  if(value) monsterHp -= value
  return monsterHp
}

// namespace 지정
// const norriGum = io.of('/norriGum');
//
// norriGum.on('connection', (socket) => {
//   console.log('norriGum 네임스페이스에 접속');
//   socket.on('disconnect', () => {
//     console.log('norriGum 네임스페이스 접속 해제');
//   });
// });

let startDate = new Date();
let endDate = new Date(startDate);
const gameMin = 1;
endDate.setMinutes(startDate.getMinutes()+gameMin);


io.on("connection", (socket) => {

  // 소켓 자동 종료 시간 설정
  setTimeout(function () {
    console.log(gameMin + ' 분 지남');
    let userCurrentRoom = getUserCurrentRoom(socket);
    io.to(userCurrentRoom).emit("noti_end_message", '시간 종료 제한된 시간안에 클리어하지 못했습니다!!');
    socket.disconnect();
  }, gameMin*60000);

  let rooms = [];
  socket.weapon = 10;

  console.log('클라이언트 접속',socket.id);
  console.log('현재 시각 : ' + startDate);
  console.log('종료 시각 시간 : ' + endDate);


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

    const value =  getMonsterHp();
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
    io.to(userCurrentRoom).emit("attack-damage", socket.userName, socket.weapon, value);
    if(value <= 0 ) {
     io.to(userCurrentRoom).emit("noti_end_message", '몬스터 격퇴 완료 !! 게임이 종료되었습니다!');
     socket.leave(userCurrentRoom);
     // socket.disconnect();
     // io.close();
   }
  });
});

server.listen(port, () => {
  console.log("Connected at " + port);
});
