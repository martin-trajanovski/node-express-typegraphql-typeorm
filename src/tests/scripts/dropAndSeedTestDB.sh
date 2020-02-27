#!/usr/bin/env bash

dropdb -U postgres postgres

createdb -U postgres postgres

psql -U postgres postgres < /home/test