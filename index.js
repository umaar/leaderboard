import fs from 'fs';
import humanFormat from 'human-format';
import csv from 'fast-csv';
import database from './lib/database.js';
import server from './lib/server.js';

const dataFile = './sample-data.csv'; // Or './data.csv'
let insertedRecordCounter = 0;

const extractResult = dataPoint => {
	/*
		Explanation of the milliseconds / 10
		We are grouping milliseconds into buckets, e.g.
		For item 12345, there are 4 records of the bucket representing 1000 / 10 milliseconds
		If we didn't divide by 10, our buckets would be too granular
	*/
	return [
		Number.parseInt(Number.parseInt(dataPoint.milliseconds, 10) / 10, 10),
		Number.parseInt(dataPoint.itemId, 10)
	];
};

const insertRecord = record => database.insertEntry(extractResult(record));

async function processRecords() {
	return new Promise(resolve => {
		fs.createReadStream(dataFile)
			.pipe(csv.parse({headers: true}))
			.on('data', record => {
				insertRecord(record).then(() => {
					insertedRecordCounter++;
				});
			})
			.on('end', resolve);
	});
}

function logInsertedRecords() {
	const formattedCounter = humanFormat(insertedRecordCounter);
	console.log('Total Records Inserted:', formattedCounter);
}

async function resetDatabase() {
	console.log('Flushing DB');
	await database.flushdb();
	console.log('Processing Records');
	const interval = setInterval(logInsertedRecords, 1000);

	await processRecords();
	clearInterval(interval);
	logInsertedRecords();
}

async function init() {
	const shouldResetDatabase = false;

	if (shouldResetDatabase) {
		await resetDatabase();
	}

	server(database.getDBInstance());
}

init();
