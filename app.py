from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from instruments.kt26 import KT26
from instruments.dummy_instrument import DummyI
from threading import Thread
import time
import eventlet
eventlet.monkey_patch()

class Param_Sweep_Thread():
    """docstring for Param_Sweep_Thread."""

    def __init__(self):
        self._running = True
        self._currently_running = False
        self.instrument_sweeper = None
        self.data_dict = None
        self.emitter = None

    def user_this_sweeper(self, instr):
        self.instrument_sweeper = instr

    def com_data(self,data_dict):
        self.data_dict = data_dict

    def set_emitter(self, emitter):
        self.emitter = emitter

    def terminate(self):
        self._running = False

    def stop_run(self):
        if self._currently_running:
            self.terminate()
            return True
        else:
            return False

    def reset(self):
        self._running = True

    def run(self):
        n = 10
        instrument_sweeper = self.instrument_sweeper
        data_dict = self.data_dict
        self._currently_running = True
        while self._running and n>0:
            data_dict['param'] = instrument_sweeper.read_data()
            self.emitter.emit("announce read kt 26", data_dict)
            n -= 1
            time.sleep(0.5)
        if not self._running:
            data_dict['message'] = 'Experiment stopped'
            self.emitter.emit("announce read kt 26", data_dict)
        self._currently_running = False
        return


app = Flask(__name__)
app.app_context().push()
socketio = SocketIO(app, async_mode='threading')

# smu = KT26('169.254.0.1')
dummy = DummyI()

experiment = Param_Sweep_Thread()
experiment.user_this_sweeper(dummy)
experiment.set_emitter(socketio)


@app.route('/')
def index():
    return render_template('index.html')


# @socketio.on("read_kt_26")
# def read_kt_26(data):
#     print(data)
#     data['a_i'] = smu.read_channel_parameter('a','i')
#     data['a_v'] = smu.read_channel_parameter('a','v')
#     data['a_r'] = smu.read_channel_parameter('a','r')
#
#     data['b_i'] = smu.read_channel_parameter('b','i')
#     data['b_v'] = smu.read_channel_parameter('b','v')
#     data['b_r'] = smu.read_channel_parameter('b','r')
#     emit("announce read kt 26", data)


@socketio.on("read_kt_26")
def read_kt_26(data):
    experiment.reset()
    experiment.com_data(data)
    t = Thread(target=experiment.run, args=())
    t.start()
    t.join()
    data['instSays'] = 'Sweep thread finished!'
    emit("announce read kt 26", data)
    return


@socketio.on("stop sweep")
def stop_sweep(data):
    print(data)
    r = experiment.stop_run()
    if r:
        print('Sweep Stopped')
        data['instSays'] = 'Ok ok!'
    else:
        data['instSays'] = 'Nothig is running buddy.'
    emit("announce read kt 26", data)
    return


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=8000, debug=True)
