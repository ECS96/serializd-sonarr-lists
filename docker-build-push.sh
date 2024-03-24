# builds and pushes a new version of the image to dockerhub
docker buildx build --platform linux/amd64 --push -t ecstephens/serializd-list-sonarr:$1 .