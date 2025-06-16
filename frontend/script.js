const socket = io("https://kgapp.onrender.com/", {
  transports: ["websocket"],
  withCredentials: false
});

let playerId = null;
let players = {};

function joinGame() {
  const name = document.getElementById("username").value;
  socket.emit("join", { name: name });
  document.getElementById("ui").style.display = "none";
}

// Receive info when a player joins
socket.on("player_joined", (data) => {
  playerId = socket.id;
  players = data.players;
  console.log("Players connected:", players);
  renderPlayers();
});

// Receive movement of other players
socket.on("player_moved", (data) => {
  if (players[data.id]) {
    players[data.id].x = data.x;
    players[data.id].y = data.y;
    renderPlayers();
  }
});

// Player left
socket.on("player_left", (data) => {
  delete players[data.id];
  renderPlayers();
});

// Movement with arrow keys
document.addEventListener("keydown", (e) => {
  if (!players[playerId]) return;

  if (e.key === "ArrowUp") players[playerId].y -= 5;
  if (e.key === "ArrowDown") players[playerId].y += 5;
  if (e.key === "ArrowLeft") players[playerId].x -= 5;
  if (e.key === "ArrowRight") players[playerId].x += 5;

  socket.emit("move", { x: players[playerId].x, y: players[playerId].y });
  renderPlayers();
});

// Simple player render on canvas
function renderPlayers() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  Object.keys(players).forEach((id) => {
    const p = players[id];
    ctx.fillStyle = id === playerId ? "blue" : "gray";
    ctx.fillRect(p.x, p.y, 20, 20);
    ctx.fillText(p.name, p.x, p.y - 5);
  });
}