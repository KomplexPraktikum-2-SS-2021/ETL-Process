import pandas as pd
import numpy as np
import os

from fhir.resources.encounter import Encounter
from fhir.resources import construct_fhir_element
from fhirclient import client
import fhirpy
import asyncio

from csv_loader import CSV_Loader
from json_builder import JSON_Builder


async def main():

    # Create an instance
    client = fhirpy.AsyncFHIRClient ('http://localhost:8080/fhir/',
        authorization='BEARER TOKEN'
    )
    
    organization = client.resource(
        'Organization',
        name='Example Organization',
        active=False
    )

    await organization.save()

    organizations = client.resources('Organization')
    resources = await organizations.search(active=False).first()
    # Through the Resource ID you can get the resource
    # For Testing, send an GET Reuqest to the url: 
    # http://localhost:8080/fhir/Organization/resource_id
    print ('Resource ID:',resources.id)


if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())