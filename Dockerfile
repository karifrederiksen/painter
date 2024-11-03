FROM node:21-alpine3.18 AS builder
COPY ./package.json /app/
COPY ./package-lock.json /app/
WORKDIR /app
RUN npm ci
COPY ./tsconfig.json ./
COPY ./vite.config.ts ./
COPY ./svelte.config.js ./
COPY ./static/ ./static/
COPY ./.svelte-kit/tsconfig.json ./.svelte-kit/
COPY ./.svelte-kit/ambient.d.ts ./.svelte-kit/
COPY ./src/ ./src/
RUN npm run build


FROM caddy:2.7.5-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/build/ /srv/
