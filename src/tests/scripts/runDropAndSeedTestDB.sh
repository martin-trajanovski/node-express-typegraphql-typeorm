#!/usr/bin/env bash

docker cp C:/Users/mtr/test-apps/docker-postgres-data/test pg-docker:/home/test

docker cp $(pwd)/src/tests/scripts/dropAndSeedTestDB.sh pg-docker:/home/dropAndSeedTestDB.sh

docker exec pg-docker ./home/dropAndSeedTestDB.sh