const socket = io("https://kgapp.onrender.com", {
  transports: ["websocket"],
  withCredentials: false
});

let players = {};
let playerId = null;
let x = 100, y = 100;

// Canvas references
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const miniCanvas = document.getElementById('miniMap');
const miniCtx = miniCanvas.getContext('2d');

// Draw main canvas
function drawMainCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id === playerId ? 'blue' : 'green';
    ctx.fillRect(p.x, p.y, 30, 30);
    ctx.fillStyle = 'black';
    ctx.fillText(id.substring(0, 4), p.x, p.y - 5);
  }
}

// Draw minimap
function drawMiniMap() {
  miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
  for (let id in players) {
    const p = players[id];
    const miniX = (p.x / canvas.width) * miniCanvas.width;
    const miniY = (p.y / canvas.height) * miniCanvas.height;
    miniCtx.fillStyle = id === playerId ? 'blue' : 'green';
    miniCtx.beginPath();
    miniCtx.arc(miniX, miniY, 4, 0, 2 * Math.PI);
    miniCtx.fill();
  }
}

// Movement
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') y -= 5;
  if (e.key === 'ArrowDown') y += 5;
  if (e.key === 'ArrowLeft') x -= 5;
  if (e.key === 'ArrowRight') x += 5;
  socket.emit("move", { id: playerId, x, z: y });
});

// Game loop
function gameLoop() {
  drawMainCanvas();
  drawMiniMap();
  requestAnimationFrame(gameLoop);
}

// When joined
function joinGame() {
  const avatar = document.getElementById("avatarSelect").value;
  playerId = socket.id;
  socket.emit("new-player", { id: playerId, avatar });
}

// Incoming player positions
socket.on("update-positions", (data) => {
  players[data.id] = { x: data.x, y: data.z };
});

// Task complete
socket.on("task-complete", (data) => {
  console.log('✅ Task Completed: ${data.label} by ${data.id}');
});

// Sync all players
socket.on("task-sync", (data) => {
  console.log("Tasks synced", data.tasks);
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

gameLoop();