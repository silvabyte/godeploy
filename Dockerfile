FROM oven/bun:1-alpine

ENV APP_URL=https://api.godeploy.app    
ENV PORT=80

RUN apk add --no-cache bash zip unzip

# Create and set working directory
WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json

# Install dependencies with frozen lockfile for production
RUN bun install --frozen-lockfile --production

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 80

CMD [ "sh", "/app/scripts/run.sh" ]
