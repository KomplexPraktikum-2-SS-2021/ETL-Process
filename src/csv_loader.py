import pandas as pd
import numpy as np
from datetime import date, datetime

class CSV_Loader:

    def __init__(self):

        self.main_path = '../data/'

        self.data_paths = { 'cases' : self.main_path + 'SL_1_Cases.csv',
                            'observations' : self.main_path + 'SL_1_Observation.csv',
                            'patients' : self.main_path + 'SL_1_Patients.csv',
                            'conditions' : self.main_path + 'SL_1_Diagnose.csv',
                            'procedures' : self.main_path + 'SL_1_Procedures.csv'}

    # Uses ; as delimiter
    def load_table(self, str_table):
        data_df = pd.read_csv(self.data_paths[str_table], sep=';')
        return data_df

