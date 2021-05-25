# ETL-Process

This repository contains all files required to define the ETL Process

You can find some pseudo-code for the mapping from the CSV schema to the FHIR schema in the `mapping.pseudo` file.

## For Testing the ETL-Process

You can test it with a local server, for example from: https://github.com/hapifhir/hapi-fhir-jpaserver-starter
Clone this project, change in this directory and run the server by using:
```bash
docker run -p 8080:8080 hapiproject/hapi:latest
```
Then you can start the main.py script

## Get version 4.0.0 for the fhirclient python module:
Just run: 
```bash
python -m pip install https://github.com/smart-on-fhir/client-py/archive/refs/tags/v4.0.0.tar.gz
```