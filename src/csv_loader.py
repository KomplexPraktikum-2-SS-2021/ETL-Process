import pandas as pd
import numpy as np
from datetime import date, datetime

class CSV_Loader:

    def __init__(self):

        self.date_parser = lambda x : datetime.strptime(x, '%Y-%m-%d %H:%M:%S')

        self.data_paths = { 'cases' : '../data/SL_1_Cases.csv',
                            'observations' : '../data/sample_data/sample_measurement.csv',
                            'patients' : '../data/sample_data/sample_person.csv',
                            'conditions' : '../data/sample_data/sample_procedure_occurrence.csv'}
        

    # Uses ; as delimiter
    def load_table(self, str_table):
        data_df = pd.read_csv(self.data_paths[str_table], sep=';')
        return data_df

