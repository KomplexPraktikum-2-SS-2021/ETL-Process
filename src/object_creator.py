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

class ObjectCreator:

    # ------------------------------ Helper Methods ------------------------------ #

    @staticmethod
    def _parse_date_time(datetime_str: str) -> FHIRDate:

        # Splitting into yyyy-mm-dd and hh:mm:ss.zzz
        # Adding T between
        case_date = str(datetime_str).split(' ', maxsplit=-1)[0]                                 # yyyy-mm-dd
        case_time = str(datetime_str).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[0]      # hh:mm:ss
        case_ms = str(datetime_str).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[1][:3]    # miliseconds
        case_tz = strftime('%z', gmtime())[:3] + ':' + strftime('%z', gmtime())[1:-2]       # timezone...germany = 00:00
        return FHIRDate(case_date + 'T' + case_time + '.' + case_ms + case_tz)

    @staticmethod
    def _parse_date(date_str: str) -> FHIRDate:
           
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

        ts = pd.Timestamp(day=day, month=month, year=year) #type: ignore
        return FHIRDate(ts.strftime('%Y-%m-%d'))

    @staticmethod
    def _map_gender(gender: str) -> str:
        if gender == "m":
            return "male"
        elif gender == "f" or gender == "w":
            return "female"
        else:
            raise Exception(f'Unknown gender code {gender}')




    # --------------------------- Object create methods -------------------------- #

    @staticmethod
    def create_encounter(case_row: pd.Series, patient_ref_id: str) -> Encounter:
        
        # Splitting into yyyy-mm-dd and hh:mm:ss.zzz
        # Adding T between
        def convert_datetime(case_dt):
            case_date = str(case_dt).split(' ', maxsplit=-1)[0]                                 # yyyy-mm-dd
            case_time = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[0]      # hh:mm:ss
            case_ms = str(case_dt).split(' ', maxsplit=-1)[1].split('.', maxsplit=-1)[1][:3]    # miliseconds
            case_tz = strftime('%z', gmtime())[:3] + ':' + strftime('%z', gmtime())[1:-2]       # timezone...germany = 00:00
            return (case_date + 'T' + case_time + '.' + case_ms + case_tz)


        subject = FHIRReference()
        subject.type = 'Patient'
        subject.reference = f'Patient/{patient_ref_id}'

        period = Period()
        period.start = ObjectCreator._parse_date_time(case_row.admission)
        period.end = ObjectCreator._parse_date_time(case_row.discharge)

        identifier = Identifier()
        identifier.value = str(case_row.id)

        encounter = Encounter()
        encounter.resource_type = 'Encounter'
        encounter.status = 'finished'
        encounter.period = period
        encounter.identifier = [identifier]
        encounter.subject = subject

        return encounter


    @staticmethod
    def create_patient(patient_row: pd.Series) -> Patient:
        
        identifier = Identifier()
        identifier.value = str(patient_row.id)

        name = HumanName()
        name.given = [patient_row.first_name]
        name.family = patient_row.last_name
        
        address = Address()
        address.line = [patient_row.street]
        address.postalCode = str(patient_row.zip)
        address.city = patient_row.city

        patient = Patient()
        patient.identifier = [identifier]
        patient.name = [name]
        patient.gender = ObjectCreator._map_gender(patient_row.sex)
        patient.birthDate = ObjectCreator._parse_date(patient_row.date_of_birth)
        patient.address = [address]

        return patient