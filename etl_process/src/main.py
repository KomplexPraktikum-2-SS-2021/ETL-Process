import logging
import pandas as pd
import numpy as np
import uuid
import os

from datetime import datetime
from time import gmtime, strftime
from fhirclient import client
from fhirclient import server

from etl_process import EtlProcess

HAPI_HOST = os.environ.get('HAPI_HOST', 'localhost')
HAPI_PORT = os.environ.get('HAPI_PORT', '8080')

# Create an instance
settings = {
    'app_id' : 'my_web_app',
    'api_base' : f'http://{HAPI_HOST}:{HAPI_PORT}/fhir/'
}
smart = client.FHIRClient(settings=settings)
smart_server = server.FHIRServer(client=smart, base_uri=f'http://{HAPI_HOST}:{HAPI_PORT}/fhir/')

def main():
    logging.basicConfig(level=logging.INFO)

    tag = str(uuid.uuid4())

    process = EtlProcess(smart_server, tag)
    process.load_all()

if __name__ == '__main__':
    main()
