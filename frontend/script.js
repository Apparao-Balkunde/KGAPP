const socket = io("https://kgapp.onrender.com/", {
  transports: ["websocket"],
  withCredentials: false
});

let players = {};
let playerId = null;
let x = 100, y = 100;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const miniCanvas = document.getElementById("miniMap");
const miniCtx = miniCanvas.getContext("2d");

function joinGame() {
  const avatar = document.getElementById("avatarSelect").value || "default";
  document.getElementById("menu").style.display = "none";
  socket.emit("new-player", { id: socket.id, avatar });
}

function drawMainCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  Object.entries(players).forEach(([id, p]) => {
    if (!p || p.x === undefined || p.y === undefined) return;
    ctx.fillStyle = id === playerId ? "blue" : "green";
    ctx.fillRect(p.x, p.y, 30, 30);
    ctx.fillStyle = "black";
    ctx.fillText(p.avatar || "P", p.x, p.y - 5);
  });
}

function drawMiniMap() {
  miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
  Object.entries(players).forEach(([id, p]) => {
    if (!p || p.x === undefined || p.y === undefined) return;
    const miniX = (p.x / canvas.width) * miniCanvas.width;
    const miniY = (p.y / canvas.height) * miniCanvas.height;
    miniCtx.fillStyle = id === playerId ? "blue" : "green";
    miniCtx.beginPath();
    miniCtx.arc(miniX, miniY, 4, 0, 2 * Math.PI);
    miniCtx.fill();
  });
}

function gameLoop() {
  drawMainCanvas();
  drawMiniMap();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (!playerId) return;
  if (e.key === "ArrowUp") y -= 5;
  if (e.key === "ArrowDown") y += 5;
  if (e.key === "ArrowLeft") x -= 5;
  if (e.key === "ArrowRight") x += 5;

  socket.emit("move", { id: playerId, x, y });
});

socket.on("connect", () => {
  playerId = socket.id;
});

socket.on("update-positions", (data) => {
  if (!players[data.id]) players[data.id] = {};
  players[data.id].x = data.x;
  players[data.id].y = data.z; // server sends z as y
});

socket.on("task-complete", (data) => {
  console.log('✅ Task Completed: ${data.label} by $
{data.id}');
});

gameLoop();