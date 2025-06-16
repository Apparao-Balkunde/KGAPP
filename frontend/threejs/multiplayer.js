
const socket = io('http://localhost:5000');
const players = {};

function create3DAvatar(data) {
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const color = data.costume === "pheta" ? 0xff0000 : 0x00ff00;
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.x, data.y, data.z);
    scene.add(mesh);

    const div = document.createElement('div');
    div.className = 'name-label';
    div.textContent = data.name;
    const label = new CSS2DObject(div);
    mesh.add(label);

    return mesh;
}

function updatePlayerPosition(data) {
    if (players[data.id]) {
        players[data.id].position.set(data.x, data.y, data.z);
    }
}

socket.on('connect', () => {
    socket.emit('new-player', { id: socket.id });
});

socket.on('new-player', (data) => {
    if (!players[data.id]) {
        players[data.id] = create3DAvatar(data);
    }
});

socket.on('update-positions', updatePlayerPosition);

socket.on('player-disconnected', (data) => {
    if (players[data.id]) {
        scene.remove(players[data.id]);
        delete players[data.id];
    }
});

function sendMovement(x, y, z) {
    socket.emit('move-player', { id: socket.id, x, y, z });
}
