FROM node:16-alpine

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/
RUN npm config set unsafe-perm true
RUN npm install
RUN chown -R node /app/node_modules

