FROM nginx:alpine

COPY ../nginx.conf /etc/nginx/nginx.conf

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]