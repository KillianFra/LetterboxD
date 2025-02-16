FROM node:22-slim

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000