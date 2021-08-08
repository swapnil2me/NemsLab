import vxi11
import pyvisa


class Instrument:

    def __init__(self, address, name=''):
        self.address = address
        self.channel = vxi11.Instrument(address, 'inst0')
        self.name = name

