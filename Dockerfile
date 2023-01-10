FROM node:18-alpine

WORKDIR /home/node

RUN apk update && apk upgrade && \
    apk add --no-cache bash git yarn make gcc g++ python3

RUN npm install -g gatsby-cli

EXPOSE 8001 9000
