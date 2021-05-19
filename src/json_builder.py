import re

import pandas as pd

class JSON_Builder:

    def create_patient_dict(self, patient_row):

        def map_gender(gender: str) -> str:
            if gender == "m":
                return "male"
            elif gender == "f" or gender == "w":
                return "female"
            else:
                raise Exception(f'Unknown gender code {gender}')

        def parse_date(date_str: str) -> str:
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

        patient_dict = {

            "identifier": [{
                "value": patient_row.id
            }],

            "name": [{
                "given": [patient_row.first_name],
                "family": patient_row.last_name
            }],

            "gender": map_gender(patient_row.sex),
            "birthDate": parse_date(patient_row.date_of_birth),

            "address": [{
                "line": [patient_row.street],
                "postalCode": patient_row.zip,
                "city": patient_row.city
            }]
        }

        return patient_dict

    def create_encounter_dict(self, df_row):
        this_dict = {
            "resourceType" : "Encounter",
            "identifier" : [{
                "value" : str(df_row.id)
            }],
            "status" : "finished",
            "class" : {
                "system" : "http://terminology.h17.org/CodeSystem/v3-ActCode",
                "version" : "2018-08-12",
                "code" : "IMP"
            },
            "period" : {
                "start" : df_row.admission,
                "end" : df_row.discharge
            }
        }

        return this_dict

