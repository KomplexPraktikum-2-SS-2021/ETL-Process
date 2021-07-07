## Using Docker compose
In order to run a fresh built version of the docker containers just run:
```bash
docker-compose up
```
(By appending `--force-recreate` new containers will be created before starting i.e. the hapi fhir server database will be empty)

Afterwards the etl-process can be executed by running
```bash
docker-compose exec etl-process python src/main.py
```

You can shut down the service by executing
```bash
docker-compose down
```