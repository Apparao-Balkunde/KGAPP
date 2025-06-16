from flask import Flask, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

players = {}
tasks = [
    {"x": 4, "z": 5, "label": "Farming", "completed": []},
    {"x": 7, "z": 2, "label": "Water", "completed": []},
    {"x": 2, "z": 8, "label": "Cooking", "completed": []}
]

@app.route('/')
def index():
    return 'Kokan Gaon Game Server Running'

@socketio.on('connect')
def handle_connect():
    print('New connection:', request.sid)

@socketio.on('new-player')
def handle_new_player(data):
    players[data['id']] = {'avatar': data['avatar'], 'x': 0, 'z': 0}
    emit('update-positions', {'id': data['id'], 'x': 0, 'z': 0}, broadcast=True)
    emit('task-sync', {'tasks': tasks}, broadcast=True)

@socketio.on('avatar-selected')
def handle_avatar_selected(data):
    if data['id'] in players:
        players[data['id']]['avatar'] = data['avatar']
        print(f"Player {data['id']} selected avatar {data['avatar']}")

@socketio.on('move')
def handle_move(data):
    pid = data['id']
    if pid in players:
        players[pid]['x'] = data['x']
        players[pid]['z'] = data['z']
        emit('update-positions', {'id': pid, 'x': data['x'], 'z': data['z']}, broadcast=True)
        for task in tasks:
            if pid not in task['completed']:
                if abs(data['x'] - task['x']) < 0.5 and abs(data['z'] - task['z']) < 0.5:
                    task['completed'].append(pid)
                    emit('task-complete', {"id": pid, "label": task['label']}, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    print('Disconnected:', request.sid)
    if request.sid in players:
        del players[request.sid]
        emit('update-positions', {'id': request.sid, 'x': -1, 'z': -1}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)