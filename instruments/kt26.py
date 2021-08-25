from instruments.instrument import Instrument
import time
import numpy as np

class KT26(Instrument):

    def __init__(self, address, name='KT26'):

        Instrument.__init__(self, address=address, name=name)


    def reset(self):
        self.channel.write('*RST')


    def turn_on(self, output_channel):
        self.channel.write(f'smu{output_channel}.source.output = smu{output_channel}.OUTPUT_ON')


    def turn_off(self, output_channel):
        self.channel.write(f'smu{output_channel}.source.output = smu{output_channel}.OUTPUT_OFF')


    def clear_buffer_all(self):
        self.channel.write('smua.nvbuffer1.clear()')
        self.channel.write('smua.nvbuffer2.clear()')
        self.channel.write('smub.nvbuffer1.clear()')
        self.channel.write('smub.nvbuffer2.clear()')


    def sample(self, parameter, count=10):
        self.channel.write('smua.measure.count = 10 ')
        self.channel.write('smua.measure.v(smua.nvbuffer1)')
        self.channel.write('printbuffer(1, smua.nvbuffer1.n, smua.nvbuffer1)')
        value = np.float_(self.channel.read().split(','))
        return value


    def read_channel_parameter(self, channel, read):

        self.channel.write('funC=smu{}.measure.{}()'.format(channel, read))
        self.channel.write('print(funC)')
        value = float(self.channel.read())
        return value


    def ramp_channel_voltage(self, channel, set_voltage, ramp_steps=200, ramp_pause=0.05, verbose=True):

        current_voltage = self.read_channel_parameter(channel, 'v')
        voltage_step = (current_voltage - set_voltage)/float(ramp_steps)
        if voltage_step == 0.0:
            print('{0} at {1} {2}'.format(self.name, set_voltage, self.unit))
            return
        if verbose:
            print('Ramping {0} to {1} {2} in {3} steps'.format(self.name, set_voltage, self.unit, ramp_steps))
        for i in range(1, ramp_steps+1):
            increment = (current_voltage - i*voltage_step) # in Volts
            self.channel.write('smu{}.source.levelv={}'.format(channel, increment))
            time.sleep(ramp_pause)


    def ramp_down(self, channel, ramp_steps=200, ramp_pause=0.05, verbose=False):

        self.ramp_channel_voltage(channel,0,ramp_steps,ramp_pause,verbose)
