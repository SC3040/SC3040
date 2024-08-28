FROM node:20 AS base

WORKDIR /src

# copy package.json from local directory to container working directory
# Install dependencies
COPY package*.json ./
RUN npm install

EXPOSE 3000

# copy all the files in local directory to container working directory
COPY . .

CMD ["npm", "run", "dev"]
