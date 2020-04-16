FROM treehouses/alpine:3.9

RUN apk --no-cache upgrade
RUN apk add --no-cache apache2 curl git
# Create directory for apache2 to store PID file
RUN mkdir -p /run/apache2

WORKDIR /var/www/localhost
RUN rm -rf htdocs
RUN git clone https://github.com/sugarlabs/turtleblocksjs.git
RUN mv -f turtleblocksjs htdocs


EXPOSE 80 443


CMD ["-D","FOREGROUND"]

# Srart httpd when container runs
ENTRYPOINT ["/usr/sbin/httpd"]
