import unittest
import pandas as pd
from resurce_name import ResourceName
from object_creator import ObjectCreator
from fhirclient.models.fhirreference import FHIRReference

class TestObjectCreator(unittest.TestCase):

    def test_create_encounter(self):
        d = {   'id' : [41162404, 41162405], 'patient_id' : [75651371, 75651372], 
                'admission' : ['2020-04-05 07:17:04.498058', '2020-04-06 08:47:09.933893'],
                'discharge' : ['2020-04-07 17:42:27.498058', '2020-04-08 08:53:29.933893']
        }
        df = pd.DataFrame(data=d)

        object_creator = ObjectCreator('tag')
        encounter = object_creator.create_encounter(df.iloc[0], '5')
        encounter = encounter.as_json()

        self.assertEqual(encounter['resourceType'], 'Encounter')
        self.assertEqual(encounter['subject']['reference'], 'Patient/5')
        self.assertEqual(encounter['identifier'][0]['value'], '41162404')
        self.assertEqual(encounter['status'], 'finished')
        self.assertEqual(encounter['period']['start'], '2020-04-05T07:17:04.498+01:00')
        self.assertEqual(encounter['period']['end'], '2020-04-07T17:42:27.498+01:00')

    def test_create_patient(self):
        d = {   'id' : [75651366], 'first_name' : ['Melissa'],
                'last_name' : ['Schinke'], 'sex' : ['w'], 'date_of_birth' : ['30.05.2015'],
                'street' : ['Nikola-Loos-Allee 12'], 'zip' : ['69213'], 'city' : ['Dresden']
        }
        df = pd.DataFrame(data=d)

        object_creator = ObjectCreator('tag')
        patient = object_creator.create_patient(df.iloc[0])
        patient = patient.as_json()
        print (patient)
        self.assertEqual(patient['resourceType'], 'Patient')
        self.assertEqual(patient['address'][0]['city'], 'Dresden')
        self.assertEqual(patient['address'][0]['postalCode'], '69213')
        self.assertEqual(patient['address'][0]['line'][0], 'Nikola-Loos-Allee 12')
        self.assertEqual(patient['gender'], 'female')
        self.assertEqual(patient['identifier'][0]['value'], '75651366')
        self.assertEqual(patient['name'][0]['family'], 'Schinke')
        self.assertEqual(patient['name'][0]['given'][0], 'Melissa')

    def test_create_condition(self):
        d = {   'id' : [542726], 'case_id' : [41162398], 'MAIN_OR_SECONDARY' : 'H', 
                'type' : '"""""Aufnahmediagnose"""""', "code" : '"""""G47.39"""""',
                'system' : 'ICD-10-GM', 'version' : '2020'
        }
        df = pd.DataFrame(data=d)

        object_creator = ObjectCreator('tag')
        condition = object_creator.create_condition(df.iloc[0], FHIRReference({'reference' : 'Patient/5', 'type': 'Patient'}), '5')
        condition = condition.as_json()

        self.assertEqual(condition['resourceType'], 'Condition')
        self.assertEqual(condition['identifier'][0]['value'], '542726')
        self.assertEqual(condition['code']['coding'][0]['system'], 'http://fhir.de/CodeSystem/dimdi/icd-10-gm')
        self.assertEqual(condition['code']['coding'][0]['version'], '2020')
        self.assertEqual(condition['subject']['reference'], 'Patient/5')
        self.assertEqual(condition['subject']['type'], 'Patient')
        self.assertEqual(condition['encounter']['reference'], 'Encounter/5')
        self.assertEqual(condition['code']['coding'][0]['code'], 'G47.39')
        self.assertEqual(condition['code']['coding'][0]['display'], 'Aufnahmediagnose')

    def test_create_procedure(self):
        d = {   'id' : [17175579], 'case_id' : [41162398], 'code' : ['1-790'],
                'code_system' : ['OPS'], "code_version" : ['2020'],
                'timestamp' : ['2020-04-03 10:16:06.489122']
        }
        df = pd.DataFrame(data=d)

        object_creator = ObjectCreator('tag')
        procedure = object_creator.create_procedure(df.iloc[0], FHIRReference({'reference' : 'Patient/5', 'type': 'Patient'}), '5')
        procedure = procedure.as_json()

        self.assertEqual(procedure['resourceType'], 'Procedure')
        self.assertEqual(procedure['identifier'][0]['value'], '17175579')
        self.assertEqual(procedure['code']['coding'][0]['code'], '1-790')
        self.assertEqual(procedure['code']['coding'][0]['system'], 'http://fhir.de/CodeSystem/dimdi/ops')
        self.assertEqual(procedure['code']['coding'][0]['version'], '2020')
        self.assertEqual(procedure['encounter']['reference'], 'Encounter/5')
        self.assertEqual(procedure['subject']['reference'], 'Patient/5')
        self.assertEqual(procedure['subject']['type'], 'Patient')

    def test_create_observation(self):
        d = {   'procedure_id' : [17175579], 'Apnoe Index (n/h)' : ['46,869'], 'Hypnopnoe�Index (n/h)' : ['15,54'],
                'RERA Index (n/h)' : ['5,023'], "AHI" : ['62,359'], "RDI" : ['67,313'], "RDI / AHI (n/h)" : ['1,079'],
                'Schlaflatenz (min)' : ['4,694'], 'Alter (Jahre)' : ['58,055'], 'Arousal Index (n/h)' : ['47,079'],
                'Schnarchzeit (min)' : ['5,177'], 'totale Schlafzeit (min)' : ['372,637'], 'Schnarchzeit Total (%Tsd)' : ['1,38'],
                'PLM Index' : '85,577',
        }
        df = pd.DataFrame(data=d)

        object_creator = ObjectCreator('tag')
        observations = object_creator.create_observation(df.iloc[0], FHIRReference({'reference' : 'Patient/5', 'type': 'Patient'}), FHIRReference({'reference' : 'Encounter/5', 'type': 'Encounter'}))
        
        # test all values for the first observation

        for i in range(0, len(observations)):
            observation = observations[i].as_json()
            self.assertEqual(observation['resourceType'], 'Observation')
            self.assertEqual(observation['encounter']['reference'], 'Encounter/5')
            self.assertEqual(observation['encounter']['type'], 'Encounter')
            self.assertEqual(observation['subject']['reference'], 'Patient/5')
            self.assertEqual(observation['subject']['type'], 'Patient')
            self.assertEqual(observation['code']['coding'][0]['system'], 'http://loinc.org')
            self.assertEqual(observation['code']['coding'][0]['version'], '2.69')
            self.assertEqual(observation['status'], 'final')

        
        self.assertEqual(observations[0].as_json()['code']['coding'][0]['code'], '90562-0')
        self.assertEqual(observations[0].as_json()['code']['coding'][0]['display'], 'Apnea index')
        self.assertEqual(observations[0].as_json()['valueQuantity']['code'], '90562-0')
        self.assertEqual(observations[0].as_json()['valueQuantity']['unit'], '{events}/h')
        self.assertEqual(observations[0].as_json()['valueQuantity']['value'], 46.869)
        self.assertEqual(observations[1].as_json()['code']['coding'][0]['code'], '90561-2')
        self.assertEqual(observations[1].as_json()['code']['coding'][0]['display'], 'Hypopnea index')
        self.assertEqual(observations[1].as_json()['valueQuantity']['code'], '90561-2')
        self.assertEqual(observations[1].as_json()['valueQuantity']['unit'], '{events}/h')
        self.assertEqual(observations[1].as_json()['valueQuantity']['value'], 15.54)
        self.assertEqual(observations[2].as_json()['code']['coding'][0]['code'], '90565-3')
        self.assertEqual(observations[2].as_json()['code']['coding'][0]['display'], 'Respiratory effort-related arousal index')
        self.assertEqual(observations[2].as_json()['valueQuantity']['code'], '90565-3')
        self.assertEqual(observations[2].as_json()['valueQuantity']['unit'], '{events}/h')
        self.assertEqual(observations[2].as_json()['valueQuantity']['value'], 5.023)
        self.assertEqual(observations[3].as_json()['code']['coding'][0]['code'], '69990-0')
        self.assertEqual(observations[3].as_json()['code']['coding'][0]['display'], 'Apnea hypopnea index 24 hour')
        self.assertEqual(observations[3].as_json()['valueQuantity']['code'], '69990-0')
        self.assertEqual(observations[3].as_json()['valueQuantity']['unit'], '{events}/h')
        self.assertEqual(observations[3].as_json()['valueQuantity']['value'], 62.359)
        self.assertEqual(observations[4].as_json()['code']['coding'][0]['code'], '90566-1')
        self.assertEqual(observations[4].as_json()['code']['coding'][0]['display'], 'Respiratory disturbance index')
        self.assertEqual(observations[4].as_json()['valueQuantity']['code'], '90566-1')
        self.assertEqual(observations[4].as_json()['valueQuantity']['unit'], '{events}/h')
        self.assertEqual(observations[4].as_json()['valueQuantity']['value'], 67.313)
        self.assertEqual(observations[5].as_json()['code']['coding'][0]['code'], '30525-0')
        self.assertEqual(observations[5].as_json()['code']['coding'][0]['display'], 'Age')
        self.assertEqual(observations[5].as_json()['valueQuantity']['code'], '30525-0')
        self.assertEqual(observations[5].as_json()['valueQuantity']['unit'], 'a')
        self.assertEqual(observations[5].as_json()['valueQuantity']['value'], 58.055)
        self.assertEqual(observations[6].as_json()['code']['coding'][0]['code'], '93832-4')
        self.assertEqual(observations[6].as_json()['code']['coding'][0]['display'], 'Sleep duration')
        self.assertEqual(observations[6].as_json()['valueQuantity']['code'], '93832-4')
        self.assertEqual(observations[6].as_json()['valueQuantity']['unit'], 'min')
        self.assertEqual(observations[6].as_json()['valueQuantity']['value'], 372.637)
    
    def test_parse_datetime(self):
        object_creator = ObjectCreator('tag')
        dt = '2020-04-05 07:17:04.498058'
        parsed_datetime = object_creator._parse_date_time(dt).as_json()
        self.assertEqual(parsed_datetime, '2020-04-05T07:17:04.498+01:00')

    def test_map_gender(self):
        self.assertEqual(ObjectCreator('tag')._map_gender('f'), 'female')
        self.assertEqual(ObjectCreator('tag')._map_gender('w'), 'female')
        self.assertEqual(ObjectCreator('tag')._map_gender('m'), 'male')
        #self.assertEqual(ObjectCreator('tag')._map_gender('female'), 'female')
        #self.assertEqual(ObjectCreator('tag')._map_gender('male'), 'male')
    
    def test_parse_date(self):
        b_date = '10.05.2020'
        parsed_date = ObjectCreator('tag')._parse_date(b_date).as_json()
        self.assertEqual(parsed_date, '2020-05-10')
    
    def test_construct_reference(self):
        ref_patient = ObjectCreator('tag')._construct_reference(ResourceName.PATIENT, '5').as_json()
        self.assertEqual(ref_patient['reference'], 'Patient/5')
        self.assertEqual(ref_patient['type'], 'Patient')
    
    def test_construct_identifier(self):
        identifier_patient = ObjectCreator('tag')._construct_reference(ResourceName.PATIENT, '5').as_json()
        self.assertEqual(identifier_patient['reference'], 'Patient/5')
        self.assertEqual(identifier_patient['type'], 'Patient')

    def test_construct_identifier(self):
        identifier_patient = ObjectCreator('tag')._construct_reference(ResourceName.PATIENT, '5').as_json()
        self.assertEqual(identifier_patient['reference'], 'Patient/5')
        self.assertEqual(identifier_patient['type'], 'Patient')


if __name__ == '__main__':
    unittest.main()