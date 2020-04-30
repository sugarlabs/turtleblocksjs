FROM treehouses/nginx:alpine3.11-rpi

RUN apk --no-cache upgrade
RUN apk add --no-cache curl git


WORKDIR /var/lib/nginx
RUN rm -rf html
RUN git clone --depth=1 https://github.com/sugarlabs/turtleblocksjs.git
RUN mv -f turtleblocksjs html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
