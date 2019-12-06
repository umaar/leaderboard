const express = require('express');
const bodyParser = require('body-parser');

const calculatePosition = candidates => candidates.reduce((previous, current) => current.count + previous, 0) + 1;

const getCandidates = (data, time) => Object.keys(data)
	.filter(item => item !== 'total' && item < time)
	.map(key => ({time: key, count: parseInt(data[key], 10)}));

function startServer(database) {
	const getPosition = ([[time, trackId], total]) =>
		database.getAllItemTimings(trackId).then(data => {
			const candidates = getCandidates(data, time);
			return {
				position: calculatePosition(candidates),
				total
			};
		});

	const app = express();
	const port = 3000;
	app.use(bodyParser.urlencoded({extended: false}));

	app.use((request, response, next) => {
		response.header('Access-Control-Allow-Origin', '*');
		response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});

	app.listen(port, () => console.log('\n ready on port',
		port));

	app.post('/itemTime', ({body: {time, itemId}}, response) => {
		if (!time || !itemId) {
			return response.status(400).send('Bad request');
		}

		database.insertEntry([parseInt(time, 10) / 10, itemId])
			.then(getPosition)
			.then(result => response.send(result));
	});

	app.get('/allItemTimes/:trackId', (request, response) => {
		const {trackId} = request.params;
		let {currentTime} = request.query;

		if (!trackId) {
			return response.status(400).send('Bad request');
		}

		database.getAllItemTimings(trackId).then(result => {
			if (!result) {
				return response.status(404).send('Not found');
			}

			let data = [];
			for (let [time, count] of Object.entries(result)) {
				time = parseInt(time, 10);
				if (Number.isInteger(time)) {
					const entry = {
						time: (time / 100) + 's',
						rawTime: time,
						count
					};

					// Why did I do this 🤔️ ?
					// if (count > 1) {
					// 	entry.count = count - 1;
					// }

					data.push(entry);
				}
			}

			data = data.sort((a, b) => {
				if (a.rawTime > b.rawTime) {
					return 1;
				}

				if (a.rawTime < b.rawTime) {
					return -1;
				}

				// A must be equal to b
				return 0;
			});

			if (currentTime) {
				currentTime = parseInt(parseInt(currentTime, 10) / 10, 10);
				for (const [index, item] of data.entries()) {
					if (currentTime === item.rawTime) {
						console.log('\n\n What!!', index);
						item.currentScrore = true;
						break;
					}
				}
			}

			// Prettify JSON output
			response.header('Content-Type', 'application/json');
			response.send(JSON.stringify({timings: data}, null, 4));

			// Res.send({
			// 	timings: data
			// });
		});
	});

	/*
	*
		Answers the question: how many users, as a percentage, scored less than ?milliseconds=1000
		*/
	app.get('/stats/:trackId', (request, response) => {
		const {trackId} = request.params;

		if (trackId) {
			/* In dev */
			database.getAllItemTimings(trackId).then(result => {
				if (!result) {
					return response.status(404).send('Not found');
				}

				let data = [];
				for (let [time, count] of Object.entries(result)) {
					time = parseInt(time, 10);
					if (Number.isInteger(time)) {
						const entry = {
							time: (time / 100) + 's',
							rawTime: time
						};

						if (count > 1) {
							entry.count = count - 1;
						}

						data.push(entry);
					}
				}

				const timingBuckets = {};

				data = data.filter(item => {
					const rawTime = item.rawTime * 10;

					if (rawTime < 1000 || rawTime > 10000) {
						return false;
					}

					return true;
				});

				data.forEach(timing => {
					const rawTime = timing.rawTime / 100;
					if (timing.count) {
						const bucket = Math.floor(rawTime).toString();
						if (timingBuckets[bucket] > 0) {
							timingBuckets[bucket] += timing.count;
						} else {
							timingBuckets[bucket] = timing.count;
						}
					}
				});

				let runningTotal = 0;
				for (let i = 1; i <= 10; i++) {
					runningTotal += timingBuckets[i];
					timingBuckets[i] = runningTotal;
				}

				const total = data.reduce((previous, current) => {
					if (current.count) {
						return previous + current.count;
					}

					return previous;
				}, 0);

				response.send({timingBuckets, total});
			});
		} else {
			response.status(400).send('Bad request');
		}
	});
}

module.exports = database => {
	startServer(database);
};
