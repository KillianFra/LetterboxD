FROM node:20-alpine

WORKDIR /

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run ubuntu-build

EXPOSE 3000

CMD ["npm", "run", "start"]