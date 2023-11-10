# The default target must be at the top
.DEFAULT_GOAL := start

install:
	npm install

update-deps:
	ncu -u

ping:
	curl --data 'time=8800&itemId=110637645' 0.0.0.0:3000/itemTime

start:
	node index.js

test:
	echo "cool"