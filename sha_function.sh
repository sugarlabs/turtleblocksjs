#!/bin/bash
#set -x
get_sha(){
    repo=$1
    docker pull $1 &>/dev/null
    #sha=$(docker image inspect $1 |jq .[0].RootFS.Layers |grep sha)
    sha=$(docker image inspect $1 | jq --raw-output '.[0].RootFS.Layers|.[]')   # [0] means first element of list,[]means all the elments of lists
    echo $sha
}
is_base (){
    local base_sha    # nginx
    local image_sha   # turtleblocksjs
    base_repo=$1
    image_repo=$2
    base_sha=$(get_sha $1)
    image_sha=$(get_sha $2)

    found="true"
    for i in $base_sha; do
        for j in $image_sha; do
            if [ "$i" = "$j" ]; then
                #echo "no change, same base image: $i"
                found="false"
                break
            fi
        done
    done
    echo "$found"
}

#image_version(){
#    local version
#    repo=$1    # nginx repo
#    version=$(docker run -it $1 /bin/sh -c "nginx -v" |awk '{print$3}')
#    echo $version
#}
#
#compare (){
#    result=$(is_base $1 $2)
#    version1=$(image_version $3)
#    version2=$(image_version $4)
#    if [ $result == "true" ] || [ "$version1" != "$version2" ];
#    then
#        echo "true"
#    else
#        echo "false"
#    fi
#}
compare (){
    result=$(is_base $1 $2)
    version1=$(image_version $3)
    version2=$(image_version $4)
    if [ $result == "true" ] || [ "$version1" != "$version2" ];
    then
        echo "true"
    else
        echo "false"
    fi
}

create_manifest (){
    local repo=$1
    local tag1=$2
    local tag2=$3
    local x86=$4
    local rpi=$5
    local arm64=$6
    docker manifest create $repo:$tag1 $x86 $rpi $arm64
    docker manifest create $repo:$tag2 $x86 $rpi $arm64
    docker manifest annotate $repo:$tag1 $x86 --arch amd64
    docker manifest annotate $repo:$tag1 $rpi --arch arm
    docker manifest annotate $repo:$tag1 $arm64 --arch arm64
    docker manifest annotate $repo:$tag2 $x86 --arch amd64
    docker manifest annotate $repo:$tag2 $rpi --arch arm
    docker manifest annotate $repo:$tag2 $arm64 --arch arm64

}
#get_sha $@

#is_base $@
