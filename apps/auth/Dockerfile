FROM node:alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN npm install 

COPY apps/auth apps/auth
COPY libs libs

RUN cd apps/auth
RUN npm install 

RUN npm run build auth

CMD ["node", "dist/apps/auth/src/main"]
