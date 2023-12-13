FROM node:16.3.0-alpine

WORKDIR '/app'

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 8080

CMD ["npm", "run", "build"]