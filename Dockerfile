FROM oven/bun:1-alpine

ENV NODE_ENV=production
ENV APP_URL=https://api.godeploy.app
ENV PORT=80

RUN apk add --no-cache bash zip unzip

# Create and set working directory
WORKDIR /app

# Copy workspace manifests and lockfile
COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/package.json
COPY apps/auth/package.json apps/auth/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY apps/marketing/package.json apps/marketing/package.json
COPY libs/testing/package.json libs/testing/package.json

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 80

CMD [ "sh", "/app/scripts/run.sh" ]
