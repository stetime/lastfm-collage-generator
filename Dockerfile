FROM node:lts-alpine
WORKDIR /app

RUN apk add --update --no-cache \
  make \
  g++ \
  jpeg-dev \
  cairo-dev \
  giflib-dev \
  pango-dev \
  libtool \
  autoconf \
  automake \
  python3 \
  unifont 

COPY package.json .
RUN npm install
COPY --chown=node:node . .
EXPOSE 3000
RUN npm run build
USER node
CMD ["node", "dist/index.js"]