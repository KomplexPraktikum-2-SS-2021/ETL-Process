import pandas as pd
import numpy as np
import re
from datetime import datetime
from time import gmtime, strftime

from fhirclient import client
from fhirclient import server

# Fhir Object Imports
from fhirclient.models.encounter import Encounter
from fhirclient.models.patient import Patient

# Attribute Imports
from fhirclient.models.period import Period
from fhirclient.models.fhirdate import FHIRDate
from fhirclient.models.identifier import Identifier
from fhirclient.models.humanname import HumanName
from fhirclient.models.address import Address
from fhirclient.models.fhirreference import FHIRReference
from fhirclient.models.reference import Reference

class Object_Creator:

    def create_encounter(self, case_row, ref_id):

        # Splitting into yyyy-mm-dd and hh:mm:ss.zzz
        # Adding T between
        def convert_datetime(case_dt):
            case_date = str(case_dt).split(' ', maxsplit=-1)[0]                                 # yyyy-mm-dd
            case_time = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[0]      # hh:mm:ss
            case_ms = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[1][:3]    # miliseconds
            case_tz = strftime('%z', gmtime())[:3] + ':' + strftime('%z', gmtime())[1:-2]       # timezone...germany = 00:00
            return (case_date + 'T' + case_time + '.' + case_ms + case_tz)

        encounter = Encounter()
        encounter.resource_type = 'Encounter'
        encounter.status = 'finished'
        encounter_period = Period()
        encounter_period.start = FHIRDate(convert_datetime(case_row.admission))
        encounter_period.end = FHIRDate(convert_datetime(case_row.discharge))
        encounter.period = encounter_period
        encounter_id = Identifier()
        encounter_id.value = str(case_row.id)
        encounter.identifier = [encounter_id]
        encounter_ref = FHIRReference()
        encounter_ref.type = 'Patient'
        encounter_ref.reference = 'Patient/' + str(ref_id)
        encounter.subject = encounter_ref

        return encounter

    def create_patient(self, patient_row):
        def map_gender(gender: str) -> str:
            if gender == "m":
                return "male"
            elif gender == "f" or gender == "w":
                return "female"
            else:
                raise Exception(f'Unknown gender code {gender}')

        def parse_date(date_str: str):
            DOT = r'\.'
            DATE_PATTERN = re.compile(
                r'(?P<day>\d{2})' + DOT +   \
                r'(?P<month>\d{2})' + DOT + \
                r'(?P<year>\d{4})'
            )
            match = DATE_PATTERN.match(date_str)
            day = int(match.group('day'))
            month = int(match.group('month'))
            year = int(match.group('year'))

            ts = pd.Timestamp(day=day, month=month, year=year)
            return ts.strftime('%Y-%m-%d')

        #patient_dict = {
        #    "identifier": [{
        #        "value": patient_row.id
        #    }],
        #    "name": [{
        #        "given": [patient_row.first_name],
        #        "family": patient_row.last_name
        #    }],

        #    "gender": map_gender(patient_row.sex),
        #    "birthDate": parse_date(patient_row.date_of_birth),

        #    "address": [{
        #        "line": [patient_row.street],
        #        "postalCode": patient_row.zip,
        #        "city": patient_row.city
        #    }]
        #}

        patient = Patient()
        identifier = Identifier()
        identifier.value = str(patient_row.id)
        patient.identifier = [identifier]
        patient_name = HumanName()
        patient_name.given = [patient_row.first_name]
        patient_name.family = patient_row.last_name
        patient.name = [patient_name]
        patient.gender = map_gender(patient_row.sex)
        #patient.birthDate
        patient_address = Address()
        patient_address.line = [patient_row.street]
        patient_address.postalCode = str(patient_row.zip)
        patient_address.city = patient_row.city
        patient.address = [patient_address]

        return patient
    
    # ref_id is the id in the URL
    def create_fhirDic(self, table_str, df_row, ref_id=None):
        fhir_el = None
        if (table_str == 'patients'):
            fhir_el = self.create_patient(df_row)
        if (table_str == 'cases'):
            fhir_el = self.create_encounter(df_row, ref_id)
        
        return fhir_el


