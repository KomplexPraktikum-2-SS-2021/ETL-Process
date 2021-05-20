import pandas as pd
import numpy as np
from datetime import datetime
from time import gmtime, strftime

from fhirclient import client
from fhirclient import server
from fhirclient.models.encounter import Encounter
from fhirclient.models.period import Period
from fhirclient.models.fhirdate import FHIRDate

# Splitting into yyyy-mm-dd and hh:mm:ss.zzz
# Adding T between
def convert_datetime(case_dt):
    case_date = str(case_dt).split(' ', maxsplit=-1)[0]                                 # yyyy-mm-dd
    case_time = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[0]      # hh:mm:ss
    case_ms = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[1][:3]    # miliseconds
    case_tz = strftime('%z', gmtime())[:3] + ':' + strftime('%z', gmtime())[1:-2]       # timezone...germany = 00:00
    return (case_date + 'T' + case_time + '.' + case_ms + case_tz)

def create_encounter(case):
    encounter = Encounter()
    encounter.resource_type = 'Encounter'
    encounter.status = 'finished'
    encounter_start = FHIRDate(convert_datetime(case.admission))
    encounter_end = FHIRDate(convert_datetime(case.discharge))
    encounter_period = Period()
    encounter_period.start = encounter_start
    encounter_period.end = encounter_end
    encounter.period = encounter_period

    return encounter


class Object_Creator:

    def create_fhirDic(self, table_str, df_row):
        fhirDic = 0;

        if table_str == 'cases':
            fhirDic = create_encounter(df_row)

        return fhirDic

