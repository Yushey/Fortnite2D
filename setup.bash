#!/bin/bash
PORT="$1";

if [ -z "$PORT" ];
then
	echo "Usage: ./setup.bash PORT"
	exit 0
fi

sed -e "s/PORT/$PORT/" ./dev/ftd-template.js > ftd.js

cd db
sqlite3 database.db < schema.sql
cd ..
cd ..
chmod 777 ftd/
chmod -R 777 ftd/
cd ftd
npm install
