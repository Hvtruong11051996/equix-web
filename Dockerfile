FROM node:alpine
WORKDIR /usr/src/app
COPY ./dist/ ./dist/
COPY ./webserver.js/ .
COPY ./package1.json/ ./package.json
RUN npm i
CMD node webserver