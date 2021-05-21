import logging
import pandas as pd
import numpy as np
from datetime import datetime
from time import gmtime, strftime

from fhirclient import client
from fhirclient import server

from csv_loader import CSV_Loader
from etl_process import EtlProcess
from object_creator import Object_Creator


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
object_creator = Object_Creator()

def find_ref_element(a_list, row_ref_id):
    for index in range(0, len(a_list)):
        if (int(a_list[index]['resource']['identifier'][0]['value']) == row_ref_id):
            return a_list[index]['resource']


## ETL PROCESS
def main():

    for index in range(0, len(header_list)):
        act_dataframe = csv_loader.load_table(header_list[index])

        # Creating and Sending FHIR Elements
        for ind in range(0, act_dataframe.shape[0]):
            df_row = act_dataframe.iloc[ind]
            print(type(df_row))
            if (index == 0):
                fhir_element = object_creator.create_fhirDic(header_list[index], df_row)
            else:
                # GET-Request of all FHIR Elements (Dictionary), selected by res_list
                # res.entry is a list and has many entries (all encounters on server)
                server_resources = smart_server.request_json(path=res_list[index])['entry']
                ref_element = find_ref_element(server_resources, df_row[field_names[index]])
                fhir_element = object_creator.create_fhirDic(header_list[index], df_row, ref_element['id'])
            
            # POST Request
            smart_server.post_json(path=res_list[index + 1],resource_json=fhir_element.as_json())

    server_resources = smart_server.request_json(path=res_list[len(res_list)-1])['entry']

    # Output of all Encounter Elements
    for index in range (0, len(server_resources)):
        print ('Encounter URL: ', 'Encounter/' + server_resources[index]['resource']['id'])


def main2():
    logging.basicConfig(level=logging.INFO)

    process = EtlProcess(smart_server)
    process.load_all()

    # Output of all Encounter Elements
    server_resources = smart_server.request_json(path=res_list[len(res_list)-1])['entry']
    for index in range (0, len(server_resources)):
        print ('Encounter URL: ', 'Encounter/' + server_resources[index]['resource']['id'])


if __name__ == '__main__':
    main2()
