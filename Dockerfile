
FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system godeploy-api && \
          adduser --system -G godeploy-api godeploy-api

COPY apps/godeploy-api/dist godeploy-api/
RUN chown -R godeploy-api:godeploy-api .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm install

CMD [ "tsx", "godeploy-api" ]
