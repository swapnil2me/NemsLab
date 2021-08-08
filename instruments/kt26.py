from instrument import Instrument
import time


class KT26(Instrument):

    def __init__(self, address, name='KT26'):

        Instrument.__init__(self, address=address, name=name)

    def read_channel_parameter(self, channel, read):

        self.channel.write('funC=smu{}.measure.{}()'.format(channel, read))
        self.channel.write('print(funC)')
        value = float(self.channel.read())
        return value

    def ramp_channel_voltage(self, channel, set_voltage, ramp_steps=200, ramp_pause=0.05, verbose=True):

        outV = self.read_channel_parameter(channel,'v')
        rampStep = (outV - set_voltage)/float(ramp_steps)
        if rampStep == 0.0:
            print('{0} at {1} {2}'.format(self.name, set_voltage, self.unit))
            return
        if verbose:
            print('Ramping {0} to {1} {2} in {3} steps'.format(self.name, set_voltage, self.unit, ramp_steps))
        for i in range(1,ramp_steps+1):
            increment = (outV - i*rampStep) # in Volts
            self.channel.write('smu{}.source.levelv={}'.format(channel, increment))
            time.sleep(ramp_pause)
