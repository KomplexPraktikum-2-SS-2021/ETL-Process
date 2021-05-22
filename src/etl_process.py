from __future__ import annotations
from typing import *

from csv_loader import CSV_Loader
from object_creator import ObjectCreator
if TYPE_CHECKING:
    from fhirclient.server import FHIRServer
from logging import debug, warn
from resurce_name import ResourceName


csv_loader = CSV_Loader()
class EtlProcess:

    def __init__(self, server: FHIRServer):
        self.server = server

    # ------------------------------ Helper Methods ------------------------------ #

    def _find_reference_id(self, resource_name: ResourceName, identifier) -> str:
        """
        Helper function which finds the id for a given identifier from a given resource.
        This function raises an error if no resource element was found for the given identifier.
        An warning is printed if two resource elements have the same identifier (But in this case this function will return
        the id of the first element in the server result list)
        """
        path = f'{resource_name.value}/identifier={identifier}'
        debug(f'Request path: "{path}"')
        matched_elements = self.server.request_json(path=f'{resource_name.value}/?identifier={identifier}')['entry']
        
        if len(matched_elements) == 0:
            raise Exception(f'No element found from resource "{resource_name.value}" with identifier "{identifier}"')

        if len(matched_elements) > 1:
            warn(f'Ambiguous references for resource "{resource_name.value}" with identifier "{identifier}"')

        return matched_elements[0]['resource']['id']


    # --------------------------------- ETL Jobs --------------------------------- #

    def _load_patients(self):
        df = csv_loader.load_table('patients')
        for row_label, row in df.iterrows():
            fhir_element = ObjectCreator.create_patient(row)
            self.server.post_json(path=ResourceName.PATIENT.value, resource_json=fhir_element.as_json())


    def _load_encounters(self):
        df = csv_loader.load_table('cases')
        for row_label, row in df.iterrows():
            ref_id = self._find_reference_id(ResourceName.PATIENT, row['patient_id'])
            fhir_element = ObjectCreator.create_encounter(row, ref_id)
            self.server.post_json(path=ResourceName.ENCOUNTER.value, resource_json=fhir_element.as_json())

    def _load_observations(self):
        raise NotImplementedError()

    def _load_conditions(self):
        raise NotImplementedError()

    def _load_procedures(self):
        raise NotImplementedError()


    # ------------------------------ Public Methods ------------------------------ #

    def load_all(self):
        self._load_patients()
        self._load_encounters()