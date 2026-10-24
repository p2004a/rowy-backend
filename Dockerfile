# Build stage
FROM node:26-alpine AS build

WORKDIR /home/node/app

# Node 26 images no longer bundle yarn.
RUN npm install -g yarn@1.22.22

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile
COPY . ./
RUN yarn build

# Production stage
FROM node:26-alpine

WORKDIR /home/node/app

# yarn is also needed at runtime: the function builder installs and deploys
# the generated Cloud Functions with it.
RUN apk add --no-cache tini && npm install -g yarn@1.22.22 && npm cache clean --force
ENTRYPOINT ["tini", "--"]

COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile --production && yarn cache clean

COPY --from=build /home/node/app/build ./build

CMD [ "npm", "start" ]
