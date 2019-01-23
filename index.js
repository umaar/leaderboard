var fs = require('fs');
var db = require('./lib/db');
var humanFormat = require('human-format');
var csv = require('fast-csv');
var dataFile = './sample-data.csv';
let insertedRecordCounter = 0;

var extractResult = (dataPoint) => {
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


var handleRecord = (record) => db.insertEntry(extractResult(record));

function start() {
    console.log('starting');
	fs.createReadStream(dataFile)
    .pipe(csv({headers: true}))
    .on('data', (record) => {
    	handleRecord(record).then(() => {
    		insertedRecordCounter++;
    	});
    })
    .on('end', () => console.log('\nDone inserting all records'));
}

let shouldResetDatabase = true;

if (shouldResetDatabase) {
    console.log('flushing');
	db.flushdb().then(start);
	// setInterval(() => {
	// 	console.log('\nTotal Records Inserted: ', humanFormat(insertedRecordCounter));
	// }, 100);
}

