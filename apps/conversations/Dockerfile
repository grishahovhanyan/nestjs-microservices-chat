FROM node:alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install 

COPY apps/participants apps/participants
COPY libs libs

RUN cd apps/participants
RUN npm install 

RUN npm run build participants

CMD ["node", "dist/apps/participants/src/main"]
