#!/bin/sh

# Build Docker Image
docker_container_name=bevios-ui
docker_container=neutron/bevios-ui

docker build -t ${docker_container} -t ${docker_container_name}:latest .
