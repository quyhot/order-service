FROM node:12.14.0-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production
COPY . .
EXPOSE 3000
CMD [ "npm", "start"]
