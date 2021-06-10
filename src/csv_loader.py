import pandas as pd
import numpy as np
from datetime import date, datetime
import os

class CSV_Loader:

    def __init__(self):
        # absolute path of the file csv_loader.py
        self.FILES_ABS_PATH = os.path.dirname(__file__) + '/'
        self.main_path = self.FILES_ABS_PATH + '../data/'

        self.data_paths = { 'cases' : self.main_path + 'SL_1_Cases.csv',
                            'observations' : self.main_path + 'SL_1_Observation.csv',
                            'patients' : self.main_path + 'SL_1_Patients.csv',
                            'conditions' : self.main_path + 'SL_1_Diagnose.csv',
                            'procedures' : self.main_path + 'SL_1_Procedures.csv'}

        self.dtypes = { 'conditions' : {'version' : np.int32, 'case_id' : np.int64},
                        'cases' : None,
                        'observations' : None,
                        'patients' : None,
                        'procedures' : None, }

    # Uses ; as delimiter
    def load_table(self, str_table):
        data_df = pd.read_csv(self.data_paths[str_table], sep=';', encoding='utf-8', dtype=self.dtypes[str_table])
        return data_df
