# Base
FROM --platform=linux/amd64 node:18.20.4 AS base

WORKDIR /app/

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

# Builder
FROM base as builder

# Accept build argument for API URL
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

RUN npm run build

# Final
FROM --platform=linux/amd64 nginx:1.25.3-alpine as final

COPY --from=builder /app/build/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]