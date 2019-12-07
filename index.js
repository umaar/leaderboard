import fs from 'fs';
import humanFormat from 'human-format';
import csv from 'fast-csv';
import db from './lib/database.js';
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
		parseInt(parseInt(dataPoint.milliseconds, 10) / 10, 10),
		parseInt(dataPoint.itemId, 10)
	];
};

const insertRecord = record => db.insertEntry(extractResult(record));

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

async function resetDatabase() {
	console.log('Flushing DB');
	await db.flushdb();
	console.log('Processing Records');
	const interval = setInterval(() => {
		const formattedCounter = humanFormat(insertedRecordCounter);
		console.log('Total Records Inserted:', formattedCounter);
	}, 1000);

	await processRecords();
	clearInterval(interval);
}

async function init() {
	const shouldResetDatabase = true;

	if (shouldResetDatabase) {
		await resetDatabase();
	}

	server(db.getDBInstance());
}

init();
