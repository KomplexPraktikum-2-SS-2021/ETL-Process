import pandas as pd
import numpy as np
from datetime import date, datetime
import os

class CSV_Loader:

    def __init__(self):
        self.data_paths = { 'cases' : './data/SL_1_Cases.csv',
                            'observations' : './data/SL_1_Observation.csv',
                            'patients' : './data/SL_1_Patients.csv',
                            'conditions' : './data/SL_1_Diagnose.csv',
                            'procedures' : './data/SL_1_Procedures.csv'}

        self.dtypes = { 'conditions' : {'version' : np.int32, 'case_id' : np.int64},
                        'cases' : None,
                        'observations' : None,
                        'patients' : None,
                        'procedures' : None, }

    # Uses ; as delimiter
    def load_table(self, str_table):
        data_df = pd.read_csv(self.data_paths[str_table], sep=';', encoding='utf-8', dtype=self.dtypes[str_table])
        return data_df
