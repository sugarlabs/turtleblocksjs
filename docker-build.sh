#!/bin/bash
#set -x

if [ $# -le 1 ]; then
    echo "missing parameters."
    exit 1
fi

dir=$(dirname $0)
sha=$($dir/manifest-alpine-sha.sh $@)       # $1 vmnet8/nginx:latest  amd64|arm|arm64
echo $sha
base_image="vmnet8/nginx@$sha"
echo $base_image
arch=$2   # arm arm64 amd64

if [ -n "$sha" ]; then
        tag=vmnet8/turtleblocksjs-tags:$arch
        #sed "s|{{base_image}}|$base_image|g" Dockerfile.template > /tmp/Dockerfile.$arch
        sed "s|{{base_image}}|$base_image|g" Dockerfile.template > Dockerfile.$arch
        #cat /tmp/Dockerfile.$arch
        docker build -t $tag -f Dockerfile.$arch .
       # version=$(docker run -it $tag /bin/sh -c "nginx -v" |awk '{print$3}')
       # echo "$arch nginx version is $version"
        docker push $tag
fi

#archs="rpi x86 arm64"
#if [ -n "$sha" ]; then
#    base_image=vmnet8/alpine@$sha
#    echo $base_image
#    for arch in $archs; do
#        tag=vmnet8/nginx-tags:$arch
#        sed "s|{{base_image}}|$base_image|g" Dockerfile.template > /tmp/Dockerfile.$arch
#        #docker build -t $tag -f /tmp/Dockerfile.$arch
#    done
#fi
