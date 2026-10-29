ARG VERSION=0.0.0
ARG BUILD_DATE
ARG VCS_REF

FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && npm run build:server

FROM node:24-alpine AS chat

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/dist-server ./dist-server

EXPOSE 8787
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8787/health || exit 1

CMD ["node", "dist-server/index.js"]

FROM nginx:alpine

LABEL org.opencontainers.image.title="wifsimster-resume" \
      org.opencontainers.image.description="Immersive WebGL resume for Damien Battistella" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.source="https://github.com/Wifsimster/resume"

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

