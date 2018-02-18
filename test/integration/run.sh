#!/bin/bash

docker build -f ./test/integration/Dockerfile -t jwt-identity .

docker run -d --rm -p 7000:7000 --name jwt-idnt jwt-identity

sleep 2

./node_modules/.bin/tape 'test/integration/**/*.test.js' | ./node_modules/.bin/tap-summary

docker stop -t 1 jwt-idnt

# Cleanup

docker ps --filter status=dead --filter status=exited -aq | xargs docker rm -v

docker images --no-trunc | grep '<none>' | awk '{ print $3 }' | xargs docker rmi

docker volume ls -qf dangling=true | xargs docker volume rm
