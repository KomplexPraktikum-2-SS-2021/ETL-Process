import pandas as pd
import numpy as np
from datetime import datetime
from time import gmtime, strftime

from fhirclient import client
from fhirclient import server

from csv_loader import CSV_Loader
from object_creator import Object_Creator


#### main

# Create an instance
settings = {
    'app_id' : 'my_web_app',
    'api_base' : 'http://localhost:8080/fhir/'
}
smart = client.FHIRClient(settings=settings)
smart_server = server.FHIRServer(client=smart, base_uri='http://localhost:8080/fhir/')

csv_loader = CSV_Loader()
cases_df = csv_loader.load_table('cases')
object_creator = Object_Creator()

# Create and Send Encounters
index = 0
while index < cases_df.shape[0]:
    case = cases_df.iloc[index]
    encounter = object_creator.create_fhirDic('cases', case)

    # POST-Request
    smart_server.post_json(path='Encounter',resource_json=encounter.as_json())
    index = index + 1


# GET-Request of all Encounter Elements (Dictionary)
res = smart_server.request_json(path='Encounter')
# res.entry is a list and has many entries (all encounters on server)
for ind in range(0, len(res['entry'])):
    print (res['entry'][ind]['resource'])
