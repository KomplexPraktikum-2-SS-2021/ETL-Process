from __future__ import annotations
from typing import *
from fhirclient.models import procedure
from fhirclient.models.fhirreference import FHIRReference


from csv_loader import CSV_Loader
from object_creator import ObjectCreator
if TYPE_CHECKING:
    from fhirclient.server import FHIRServer
from logging import debug, info, warn
from resurce_name import ResourceName


csv_loader = CSV_Loader()
class EtlProcess:

    def __init__(self, server: FHIRServer, tag: str):
        self.server = server
        self.object_creator = ObjectCreator(tag)
        self.tag = tag

        info(f'Registered ETL process with tag "{tag}"')

    # ------------------------------ Helper Methods ------------------------------ #

    def _find_reference_id(self, resource_name: ResourceName, identifier) -> str:
        """
        Helper function which finds the id for a given identifier from a given resource.
        This function raises an error if no resource element was found for the given identifier.
        An warning is printed if two resource elements have the same identifier (But in this case this function will return
        the id of the first element in the server result list)
        """
        path = f'{resource_name.value}/?identifier={identifier}'
        debug(f'Request path: "{path}"')
        matched_elements = self.server.request_json(path=path)['entry']
        
        if len(matched_elements) == 0:
            raise Exception(f'No element found from resource "{resource_name.value}" with identifier "{identifier}"')

        if len(matched_elements) > 1:
            warn(f'Ambiguous references for resource "{resource_name.value}" with identifier "{identifier}"')

        return matched_elements[0]['resource']['id']

    def _get_resource(self, resource_name: ResourceName, id: str) -> dict:
        path = f'{resource_name.value}/{id}'
        debug(f'Request path: "{path}"')
        matched_element = self.server.request_json(path=path)
        return matched_element


    # --------------------------------- ETL Jobs --------------------------------- #

    def _load_patients(self):
        df = csv_loader.load_table('patients')
        for row_label, row in df.iterrows():
            fhir_element = self.object_creator.create_patient(row)
            self.server.post_json(path=ResourceName.PATIENT.value, resource_json=fhir_element.as_json())


    def _load_encounters(self):
        df = csv_loader.load_table('cases')
        for row_label, row in df.iterrows():
            ref_id = self._find_reference_id(ResourceName.PATIENT, row['patient_id'])
            fhir_element = self.object_creator.create_encounter(row, ref_id)
            self.server.post_json(path=ResourceName.ENCOUNTER.value, resource_json=fhir_element.as_json())

    def _load_conditions(self):
        df = csv_loader.load_table('conditions')
        for row_label, row in df.iterrows():
            encounter_ref_id = self._find_reference_id(ResourceName.ENCOUNTER, row['case_id'])
            
            encounter = self._get_resource(ResourceName.ENCOUNTER, encounter_ref_id)
            subject_ref = FHIRReference(encounter['subject'])
            
            fhir_element = self.object_creator.create_condition(row, subject_ref, encounter_ref_id)
            if fhir_element == None:
                continue
            self.server.post_json(path=ResourceName.CONDITION.value, resource_json=fhir_element.as_json())

    def _load_procedures(self):
        df = csv_loader.load_table('procedures')
        for row_label, row in df.iterrows():
            encounter_ref_id = self._find_reference_id(ResourceName.ENCOUNTER, row['case_id'])
            
            encounter = self._get_resource(ResourceName.ENCOUNTER, encounter_ref_id)
            subject_ref = FHIRReference(encounter['subject'])
            
            fhir_element = self.object_creator.create_procedure(row, subject_ref, encounter_ref_id)
            self.server.post_json(path=ResourceName.PROCEDURE.value, resource_json=fhir_element.as_json())

    def _load_observations(self):
        df = csv_loader.load_table('observations')
        for row_label, row in df.iterrows():
            procedure_ref_id = self._find_reference_id(ResourceName.PROCEDURE, row[0])
            
            procedure = self._get_resource(ResourceName.PROCEDURE, procedure_ref_id)
            subject_ref = FHIRReference(procedure['subject'])
            encounter_ref = FHIRReference(procedure['encounter'])
            
            fhir_elements = self.object_creator.create_observation(row, subject_ref, encounter_ref)
            for observation in fhir_elements:
                self.server.post_json(path=ResourceName.OBSERVATION.value, resource_json=observation.as_json())



    # ------------------------------ Public Methods ------------------------------ #

    def load_all(self):
        self._load_patients()
        self._load_encounters()
        self._load_conditions()
        self._load_procedures()
        self._load_observations()