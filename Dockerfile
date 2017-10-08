FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
RUN npm install -g webpack
COPY . /usr/src/app
RUN npm run build

EXPOSE 7777
CMD ["npm", "run", "server"]