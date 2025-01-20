FROM node:alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install 

COPY apps/messages apps/messages
COPY libs libs

RUN cd apps/messages
RUN npm install 

RUN npm run build messages

CMD ["node", "dist/apps/messages/src/main"]
