FROM node:18-alpine

ENV AMQP_SERVER=amqps://lguugvwb:UtQY1D0zOoX8s0ZvR4GunuRDk0xv8UuI@octopus.rmq3.cloudamqp.com/lguugvwb

WORKDIR /src

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3002

CMD ["npm", "start"]