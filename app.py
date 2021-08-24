from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from instruments.kt26 import KT26

app = Flask(__name__)
socketio = SocketIO(app)


@app.route('/')
def index():
    return render_template('index.html')


@socketio.on("read_kt_26")
def read_kt_26(data):
    print(data)
    emit("announce read kt 26", data)


if __name__ == '__main__':
  socketio.run(app, host='127.0.0.1', port=8000, debug=True)
