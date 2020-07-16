get_manifest_sha (){
    local repo=$1     #vmnet8/alpine:latest
    local arch=$2     # amd64 arm arm64
    docker pull -q $1 &>/dev/null
    docker manifest inspect $1 > "$2".txt
    sha=""
    i=0
    while [ "$sha" == "" ] && read -r line
    do
        archecture=$(jq .manifests[$i].platform.architecture "$2".txt |sed -e 's/^"//' -e 's/"$//')
        if [ "$archecture" = "$2" ];then
            sha=$(jq .manifests[$i].digest "$2".txt  |sed -e 's/^"//' -e 's/"$//')
            echo ${sha}
        fi
        i=$i+1
    done < "$2".txt

}
get_manifest_sha $@

