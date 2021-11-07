import vxi11
import pyvisa


class Instrument:

    def __init__(self, address, name='', type='lan'):

        self.address = address
        if type.lower() == 'lan':
            self.channel = vxi11.Instrument(self.address, 'inst0')
        elif type.lower() == 'gpib':
            rm = pyvisa.ResourceManager()
            self.channel = rm.open_resource('GPIB0::'+str(self.address)+'::INSTR')
        else:
            raise ValueError('Instrument type not recognized')

        self.name = name

    def idn_query(self):
        self.channel.write('*IDN?')
        return self.channel.read()

