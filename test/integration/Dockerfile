FROM node:carbon

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install

COPY ./index.js ./
COPY ./lib/ ./lib/
COPY ./test/integration/server.js ./server.js
COPY ./test/integration/claims.js ./claims.js

EXPOSE 7000

CMD ["node", "server.js"]
