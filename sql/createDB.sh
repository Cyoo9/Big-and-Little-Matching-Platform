#! /bin/bash
echo "creating db named ..." "database"
createdb -h localhost -p 5432 "database"
pg_ctl status

echo "Initializing tables .. "
sleep 1
psql -h localhost -p 5432 "database" < queries.sql