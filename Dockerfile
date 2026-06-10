FROM nginxinc/nginx-unprivileged:1.27-alpine

ARG APP_VERSION

USER root

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/

RUN version="${APP_VERSION:-$(date +%s)}" \
  && sed -i "s#styles.css#styles.css?v=${version}#g; s#app.js#app.js?v=${version}#g" /usr/share/nginx/html/index.html

USER 101

EXPOSE 8080
