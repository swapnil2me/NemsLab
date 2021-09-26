import vxi11
import pyvisa


class Instrument:

    def __init__(self, address, name=''):
        self.address = address
        self.channel = vxi11.Instrument(self.address, 'inst0')
        self.name = name
