#!/bin/bash

while true
do
	curl --data 'time=8800&trackId=110637645' 0.0.0.0:3000/itemTime -w '\n\n'
	curl http://127.0.0.1:3000/allItemTimes/0000/?currentTime=2970 -w '\n\n'
	sleep 5
done
