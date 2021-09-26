import vxi11
import pyvisa
from random import random


class DummyI:

    def __init__(self, address='dummy', name='dummy'):
        self.address = address
        self.channel = 'dummy'
        self.name = name


    def read_data(self):
        print('reading data')
        return random()
