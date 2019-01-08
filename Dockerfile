FROM node

RUN mkdir -p /app
WORKDIR /app

ADD . /app

ENV PORT 22
EXPOSE $PORT
