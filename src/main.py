import logging
import pandas as pd
import numpy as np
from datetime import datetime
from time import gmtime, strftime

from fhirclient import client
from fhirclient import server

from csv_loader import CSV_Loader
from etl_process import EtlProcess


# None is only used to work through the algorithm
field_names = ['None', 'patient_id']
header_list = ['patients', 'cases']
res_list = ['None', 'Patient', 'Encounter']

# Create an instance
settings = {
    'app_id' : 'my_web_app',
    'api_base' : 'http://localhost:8080/fhir/'
}
smart = client.FHIRClient(settings=settings)
smart_server = server.FHIRServer(client=smart, base_uri='http://localhost:8080/fhir/')

csv_loader = CSV_Loader()

def main():
    logging.basicConfig(level=logging.INFO)

    process = EtlProcess(smart_server)
    process.load_all()

    # Output of all Encounter Elements
    server_resources = smart_server.request_json(path=res_list[len(res_list)-1])['entry']
    for index in range (0, len(server_resources)):
        print ('Encounter URL: ', 'Encounter/' + server_resources[index]['resource']['id'])


if __name__ == '__main__':
    main()
