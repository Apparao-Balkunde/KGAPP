
from flask import Flask
from flask_socketio import SocketIO, emit
from game_logic import generate_player_data

app = Flask(__name__)
app.config['SECRET_KEY'] = 'kokan-secret'
socketio = SocketIO(app, cors_allowed_origins="*")

players = {}

@socketio.on('connect')
def handle_connect():
    print('A user connected')

@socketio.on('disconnect')
def handle_disconnect():
    disconnected_id = None
    for pid in list(players.keys()):
        disconnected_id = pid
        del players[pid]
        break
    if disconnected_id:
        emit('player-disconnected', {'id': disconnected_id}, broadcast=True)

@socketio.on('new-player')
def handle_new_player(data):
    player_id = data['id']
    player_data = generate_player_data(player_id)
    players[player_id] = player_data
    emit('new-player', player_data, broadcast=True)

@socketio.on('move-player')
def handle_move_player(data):
    if data['id'] in players:
        players[data['id']]['x'] = data['x']
        players[data['id']]['y'] = data['y']
        players[data['id']]['z'] = data['z']
        emit('update-positions', data, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000)
