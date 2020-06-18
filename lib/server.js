import express from 'express';
import bodyParser from 'body-parser';

const calculatePosition = candidates => candidates.reduce((previous, current) => current.count + previous, 0) + 1;

const getCandidates = (data, time) => Object.keys(data)
	.filter(item => item !== 'total' && item < time)
	.map(key => ({time: key, count: Number.parseInt(data[key], 10)}));

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
	app.set('json spaces', 2);

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

		database.insertEntry([Number.parseInt(time, 10) / 10, itemId])
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
				time = Number.parseInt(time, 10);
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

				return 0;
			});

			if (currentTime) {
				currentTime = Number.parseInt(Number.parseInt(currentTime, 10) / 10, 10);
				for (const [, item] of data.entries()) {
					if (currentTime === item.rawTime) {
						item.currentScrore = true;
						break;
					}
				}
			}

			response.json({timings: data});
		});
	});

	/*
	*
		Answers the question: how many users, as a percentage, scored less than ?milliseconds=1000
		*/
	app.get('/stats/:itemId', (request, response) => {
		const {itemId} = request.params;

		if (itemId) {
			/* In dev */
			database.getAllItemTimings(itemId).then(result => {
				if (!result) {
					return response.status(404).send('Not found');
				}

				let data = [];
				for (let [time, count] of Object.entries(result)) {
					time = Number.parseInt(time, 10);
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

				response.header('Content-Type', 'application/json');
				response.json({timingBuckets, total});
				// Response.json();
			});
		} else {
			response.status(400).send('Bad request');
		}
	});
}

export default database => startServer(database);
