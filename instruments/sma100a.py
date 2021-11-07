from instruments.instrument import Instrument
import time
import numpy as np


class Sma100A(Instrument):
    """
        The signal generator instrument
    """

    def __init__(self, name, address):
        """
        Initialize the instrument.
        Using only GPIB connection.
        """
        Instrument().__init__(self, address=address, name=name, type='gpib')

    def turn_on_rf(self):
        current_state = int(self.channel.query(':outp:stat?\n'))
        if current_state == 0:
            self.channel.write(':outp:stat 1')

    def turn_off_rf(self):
        current_state = int(self.channel.query(':outp:stat?\n'))
        if current_state == 1:
            self.channel.write(':outp:stat 0\n')

    def read_rf_voltage(self):
        return float(self.channel.query(':sour:pow:lev?\n'))

    def set_rf_voltage(self, voltage):
        self.channel.write(':pow ' + str(voltage) + '\n')

    def set_frequency(self, frequency):
        self.channel.write(':freq ' + str(frequency) + '\n')

    def ramp_output_voltage(self, end_voltage, step_voltage, delay):
        """
        Ramp the output voltage.
        :param end_voltage:
        :param step_voltage:
        :param delay:
        :return:
        """
        start_voltage = self.read_rf_voltage()
        if start_voltage > end_voltage:
            step_voltage = -step_voltage
        while start_voltage != end_voltage:
            self.set_rf_voltage(start_voltage)
            start_voltage += step_voltage
            time.sleep(delay)
        self.set_rf_voltage(end_voltage)
