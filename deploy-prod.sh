#!/bin/sh

if [ -z "$1" ]; then
  TAG=latest
else
  TAG=$1
fi

CONTAINER_NAME=bevios-ui
REPOSITORY=bevios
PORT=8282

REGISTRY="docker.pkg.github.com/abemelek"
IMAGE_NAME="${REGISTRY}/${REPOSITORY}/${CONTAINER_NAME}:${TAG}"

echo ""
echo "Docker Container Name: ${CONTAINER_NAME}"
echo "Docker Image Name: ${IMAGE_NAME}"
echo "Deploying Tag: ${TAG}"
echo "HAProxy Port: ${PORT}"
echo ""

# remove any old running containers
echo "Removing existing ${CONTAINER_NAME} containers"

docker stop ${CONTAINER_NAME};
docker rm -f ${CONTAINER_NAME};
docker rmi -f ${IMAGE_NAME};

docker run -dit --restart unless-stopped -d --name ${CONTAINER_NAME} -p ${PORT}:8080 \
  -e 'API_URL=https://api.bevios.com' \
  -e 'APP_URL=https://app.bevios.com' \
  -e 'ROOT_URL=https://bevios.com' \
  -e 'GOOGLE_ANALYTICS_KEY=UA-163757303-1' \
  -e 'STRIPE_PUBLIC_KEY=pk_live_VzTQtMBvUxP7wofjnA9XqK1Q' \
  -e 'CLIENT_CREDENTIALS=ZTN4ZWtPOExmWlg5WFNkSGVkdTU6N2MxODFkMWFkOWY4NDNiMTlmN2VlMjFkYWVkZWYxMjE=' \
  -e 'ROBOTS_TXT_FILE=robots.allow.all.txt' \
  -e 'BUGSNAG_API_KEY=ae325e70d3551d5c831f19a8e09be310' \
  -e 'DEPLOYMENT_ENVIRONMENT=production' \
  ${IMAGE_NAME};
