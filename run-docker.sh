#!/bin/sh
# Run Docker Container

docker_container_name=bevios-ui
docker_port_number=8282
tag=latest
docker_container="neutron/${docker_container_name}:${tag}"

# remove any old running containers
echo "Removing any existing ${docker_container_name} containers..."
docker rm -f ${docker_container_name}
echo ""

# start up the docker container
echo "Starting the ${docker_container_name} container running at localhost:${docker_port_number}"

docker run -d --name ${docker_container_name} -p ${docker_port_number}:8080 \
            -e 'API_URL=http://api.bemi.dev' \
            -e 'APP_URL=http://app.localhost:8282' \
            -e 'APP_URL=http://localhost:8383' \
            -e 'GOOGLE_ANALYTICS_KEY=UA-128393216-1' \
            -e 'CLIENT_CREDENTIALS=bVh1cVhsT1RWVEluMlo2dUhrcEg6OGM3MGFhNDhkZmU0NGQzNGFlMjA0MGUzNzU5ZmFlZTA=' \
            -e 'STRIPE_PUBLIC_KEY=pk_test_7eZakxRlnyax76SLB5uSO6y2' \
            -e 'ROBOTS_TXT_FILE=robots.disallow.all.txt' \
            -e 'BUGSNAG_API_KEY=ae325e70d3551d5c831f19a8e09be310' \
          ${docker_container}

echo ${docker_container_name}" Started"
echo ""
