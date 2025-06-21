const socket = io("https://kgapp.onrender.com/", {
  transports: ["websocket"],
  withCredentials: false
});

let players = {};
let playerId = null;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const miniCanvas = document.getElementById('miniMap');
const miniCtx = miniCanvas.getContext('2d');

let x = 100, y = 100;

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

function gameLoop() {
  drawMainCanvas();
  drawMiniMap();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') y -= 5;
  if (e.key === 'ArrowDown') y += 5;
  if (e.key === 'ArrowLeft') x -= 5;
  if (e.key === 'ArrowRight') x += 5;

  socket.emit('move', { x, y });
});

socket.on('connect', () => {
  playerId = socket.id;
  socket.emit('new_player', { x, y });
});

socket.on('player_data', (data) => {
  players = data;
});

gameLoop();