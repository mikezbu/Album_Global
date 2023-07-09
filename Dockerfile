FROM node:14-slim as builder

LABEL version="1"

WORKDIR /usr/src
COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install

COPY . .

RUN yarn build

FROM node:14-slim

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG PORT=8080
ENV PORT=${PORT}

WORKDIR /usr/app

COPY --from=builder /usr/src/node_modules ./node_modules
COPY --from=builder /usr/src/.next ./.next
COPY --from=builder /usr/src/next.config.js ./next.config.js
COPY --from=builder /usr/src/package.json ./package.json
COPY --from=builder /usr/src/robots ./robots
COPY --from=builder /usr/src/public ./public

EXPOSE ${PORT}

CMD ["yarn", "start:production"]
