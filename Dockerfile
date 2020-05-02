FROM treehouses/nginx:3.11

RUN apk --no-cache upgrade
RUN apk add --no-cache curl git


WORKDIR /var/lib/nginx
RUN rm -rf html
RUN git clone --depth=1 https://github.com/sugarlabs/turtleblocksjs.git
RUN mv -f turtleblocksjs html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
