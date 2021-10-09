from instruments.instrument import Instrument
from instruments.kt26 import KT26
import time
import numpy as np

class KT26RVG(KT26):

    def __init__(self, address, name='KT26RVG'):

        KT26.__init__(self, address=address, name=name)
        self.channel_dict = {'vsd':'a','vg':'b'}


    def set_state(self,var_name,value):

        chanel_name = self.channel_dict[var_name]
        if var_name == 'vsd':
            unit_scale = 1000.0
        elif var_name == 'vg':
            unit_scale = 1.0
        else:
            print('invalid param')
            return

        self.ramp_channel_voltage(chanel_name, value/unit_scale, 10)


    def read_data(self,var_name,param_name):

        if param_name.lower() == 'i':
            unit_scale = 1e9
        else:
            unit_scale = 1
        chanel_name = self.channel_dict[var_name]
        return unit_scale*self.read_channel_parameter(chanel_name, param_name.lower())


    def ramp_down(self):
        self.ramp_channel_voltage('a', 0, 1)
        self.ramp_channel_voltage('b', 0, 1)
