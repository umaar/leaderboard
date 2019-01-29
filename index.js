const fs = require('fs');
const humanFormat = require('human-format');
const csv = require('fast-csv');
const db = require('./lib/db');

const dataFile = './sample-data.csv';
let insertedRecordCounter = 0;
const server = require('./lib/server');

const extractResult = dataPoint => {
	/*
        Explanation of the milliseconds / 10
        We are grouping milliseconds into buckets, e.g.
        For item 12345, there are 4 records of the bucket representing 1000 / 10 milliseconds
        If we didn't divide by 10, our buckets would be too granular
    */
	return [
		parseInt(parseInt(dataPoint.milliseconds) / 10),
		parseInt(dataPoint.itemId)
	];
};

server(db.getDBInstance());

const handleRecord = record => db.insertEntry(extractResult(record));

function start() {
	console.log('starting');
	fs.createReadStream(dataFile)
		.pipe(csv({headers: true}))
		.on('data', record => {
    	handleRecord(record).then(() => {
    		insertedRecordCounter++;
    	});
		})
		.on('end', () => console.log('\nDone inserting all records'));
}

const shouldResetDatabase = true;

if (shouldResetDatabase) {
	console.log('flushing');
	db.flushdb().then(start);
	// SetInterval(() => {
	// 	console.log('\nTotal Records Inserted: ', humanFormat(insertedRecordCounter));
	// }, 100);
}

