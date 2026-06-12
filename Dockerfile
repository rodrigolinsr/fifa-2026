FROM node:20-alpine

ARG APP_VERSION

WORKDIR /app

COPY public/ /app/public/
COPY server.js /app/server.js

RUN version="${APP_VERSION:-$(date +%s)}" \
  && sed -i "s#styles.css#styles.css?v=${version}#g; s#app.js#app.js?v=${version}#g" /app/public/index.html

RUN mkdir -p /data

EXPOSE 8080

CMD ["node", "server.js"]
