from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from instruments.kt26 import KT26
from instruments.dummy_instrument import DummyI
from threading import Thread
import time
import numpy as np
# import eventlet
# eventlet.monkey_patch()

read_count = 0

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

    def get_sweep_list(self, sweep_type, start, stop, step):
        if sweep_type == 'oneWay':
            fw = np.arange(start, stop+step, step)
            bw = np.arange(stop, start-step, -step)
            return np.concatenate((fw,bw))
        elif sweep_type == 'mirror':
            fw = np.arange(start, stop+step, step)
            bw = np.arange(stop, start-step, -step)
            bw_minus = np.arange(start, -1*stop-step, -step)
            fw_minus = np.arange(-1*stop, start+step, step)
            return np.concatenate((fw,bw,bw_minus,fw_minus))
        else:
            return np.arange(0,1,1)

    def run(self):
        global read_count
        instrument_sweeper = self.instrument_sweeper
        data_dict = self.data_dict
        self._currently_running = True

        # set fixed_var
        instrument_sweeper.set_state(data_dict['fixed_var'],data_dict['fixed_var_val'])

        # get sweep var List
        sweep_var_list = self.get_sweep_list(data_dict['sweep_type'],float(data_dict['sweep_start']),float(data_dict['sweep_end']),float(data_dict['sweep_step']))

        print(sweep_var_list)
        # time.sleep(10)
        for i in sweep_var_list:
            read_count += 1
            print(i)
            instrument_sweeper.set_state(data_dict['sweep_var'],i)
            data_dict['x'] = i
            data_dict['y'] = instrument_sweeper.read_data()
            data_dict['n'] = read_count
            self.emitter.emit("dara_read", data_dict)
            time.sleep(0.5)

        if not self._running:
            data_dict['message'] = 'Experiment stopped'
            self.emitter.emit("dara_read", data_dict)
        self._currently_running = False
        return


app = Flask(__name__)
# app.app_context().push()
socketio = SocketIO(app, async_mode='threading')


# smu = KT26('169.254.0.1')
dummy = DummyI()

experiment = Param_Sweep_Thread()
experiment.user_this_sweeper(dummy)
experiment.set_emitter(socketio)


@app.route('/')
def index():
    return render_template('dashboard.html')


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


@socketio.on("sweep_start")
def read_kt_26(data):
    experiment.reset()
    experiment.com_data(data)
    expt_thread = Thread(target=experiment.run, args=())
    expt_thread.start()
    expt_thread.join()
    data['instSays'] = 'Sweep thread finished!'
    emit("data_read", data)
    emit("sweep_end")
    print('Sweep thread finished!')
    return


@socketio.on("stop_sweep")
def stop_sweep(data):
    # print(data)
    r = experiment.stop_run()
    if r:
        # print('Sweep Stopped')
        data['instSays'] = 'Ok ok!'
    else:
        data['instSays'] = 'Nothig is running buddy.'
    emit("dara_read", data)

    return


if __name__ == '__main__':
    # socketio.run(app, host='127.0.0.1', port=8000, debug=True)
    socketio.run(app, host='10.56.240.174', port=8000, debug=True)
    # app.run(host='127.0.0.1', port=8000, debug=True)
