FROM node:20

WORKDIR /app

# copy package files
COPY apps/api/package*.json ./

RUN npm install

# copy source
COPY apps/api ./

# build TS → JS
RUN npm run build

EXPOSE 8080
EXPOSE 9229   

# RUN COMPILED FILE
CMD ["npm", "start"]