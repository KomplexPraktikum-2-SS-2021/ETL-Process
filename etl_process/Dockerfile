FROM python:3.9.4

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m pip install https://github.com/smart-on-fhir/client-py/archive/refs/tags/v4.0.0.tar.gz

# COPY . .

# CMD [ "python", "./src/main.py" ]