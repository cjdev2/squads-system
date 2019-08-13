#!/usr/bin/env bash
PWD=$(pwd)
mkdir -p logs

yarn && \
yarn run build && \
forever start \
    --id "squads-web" \
    -l "${PWD}/logs/s-w.log"  \
    -e "${PWD}/logs/s-w.err"  \
    -c "yarn run server"  \
    -a \
    ./

forever list

