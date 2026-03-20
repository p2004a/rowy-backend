# Build stage
FROM node:22-alpine AS build

WORKDIR /home/node/app

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile
COPY . ./
RUN yarn build

# Production stage
FROM node:22-alpine

WORKDIR /home/node/app

RUN apk add --no-cache tini
ENTRYPOINT ["tini", "--"]

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile --production && yarn cache clean

COPY --from=build /home/node/app/build ./build

CMD [ "node", "build/index.js" ]
