FROM ubuntu
RUN apt-get update
RUN apt-get -y install unifont git python3 g++ make nodejs npm
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]