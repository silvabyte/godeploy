
FROM docker.io/node:lts-alpine

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

COPY apps/godeploy-api/dist godeploy-api/
RUN chown -R godeploy-api:godeploy-api .

# Expose the port
EXPOSE 3000

CMD [ "tsx", "godeploy-api" ]
