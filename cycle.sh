#!/bin/bash
docker stop $(docker ps -q)
docker build . -t smex_extension
docker run -d -p 443:443 -v $(pwd)/web:/var/www/localhost/htdocs -t smex_extension:latest
