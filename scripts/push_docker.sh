#!/bin/sh -e

: "${IMAGES_DOMAIN?Must specify IMAGES_DOMAIN}"

docker tag cors-proxy $IMAGES_DOMAIN/cors-proxy:latest
docker push $IMAGES_DOMAIN/cors-proxy:latest
