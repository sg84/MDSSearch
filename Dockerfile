FROM alpine as SMEX-search

RUN apk add nginx;
RUN apk add openssl;
RUN mkdir /run/nginx;

COPY default.conf /etc/nginx/conf.d/default.conf
#COPY web /var/www/localhost/htdocs/
COPY webcert.crt /etc/ssl/certs/
COPY webpriv.key /etc/ssl/private/
WORKDIR /var/www/localhost/htdocs

EXPOSE 80
EXPOSE 443
CMD ["/bin/sh", "-c", "chown -R www-data:www-data /var/www/localhost/htdocs"]
CMD ["/bin/sh", "-c", "chmod 755 $(find /var/www/localhost/htdocs -type d)"]
CMD ["/bin/sh", "-c". "chmod 644 $(find /var/www/localhost/htdocs -type f)"]
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'; nginx -s reload;"]

