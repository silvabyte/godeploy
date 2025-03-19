
FROM docker.io/node:lts-alpine

ENV APP_URL=https://api.godeploy.app    
ENV PORT=80



# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 80

CMD [ "./run.sh" ]
