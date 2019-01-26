var express = require('express');
var bodyParser = require('body-parser');


var startServer = (db, getPosition) => {

	let calculatePosition = (candidates) => candidates.reduce((prev, cur) => cur.count + prev, 0) + 1;

	var getCandidates = (data, time) => Object.keys(data)
		.filter((e) => e !== 'total' && e < time)
		.map((key) => ({ time: key, count: parseInt(data[key]) }) ) ;

	var getPosition = ([[time, trackId], total]) =>
		db.getAllTrackTimings(trackId).then((data) => {
			var candidates = getCandidates(data, time);
			return {
				position: calculatePosition(candidates),
				total: total
			};
		});

	var app = express();
	var port = 3000;
	app.use(bodyParser.urlencoded({ extended: false }));

	app.use((req, res, next) => {
	  res.header('Access-Control-Allow-Origin', '*');
	  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	  next();
	});

	app.listen(port,() => console.log('\n ready on port',
	port));

	app.post('/itemTime', ({body: {time, itemId}}, response) => {
		if (!time || !itemId) {
			return response.status(400).send('Bad request');
		}
		db.insertEntry([parseInt(time)/10, itemId])
			.then(getPosition)
			.then((result) => response.send(result));
	});


	app.get('/allItemTimes/:trackId', (req, res) => {
		var trackId = req.params.trackId;
		var currentTime = req.query.currentTime;

		if (!trackId) {
			return res.status(400).send('Bad request');
		}

		db.getAllItemTimings(trackId).then((result) => {

			if (!result) {
				return res.status(404).send('Not found');
			}

			let data = [];
			for (let [time, count] of Object.entries(result)) {
				time = parseInt(time);
				if (Number.isInteger(time)) {
					var entry = {
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
			data = data.sort(function (a, b) {
			  if (a.rawTime > b.rawTime) {
			    return 1;
			  }
			  if (a.rawTime < b.rawTime) {
			    return -1;
			  }
			  // a must be equal to b
			  return 0;
			});

			if (currentTime) {
				currentTime = parseInt(parseInt(currentTime) / 10);
				for (let [index, item] of data.entries()) {
					if (currentTime === item.rawTime) {
						console.log("\n\n What!!", index);
						item.currentScrore = true;
						break;
					}
				}
			}

			// Prettify JSON output
			res.header("Content-Type",'application/json');
			res.send(JSON.stringify({timings: data}, null, 4));

			// res.send({
			// 	timings: data
			// });

		});

	});



	/*
	*
		Answers the question: how many users, as a percentage, scored less than ?milliseconds=1000
	*/
	app.get('/stats/:trackId', (req, res) => {
		var trackId = req.params.trackId;

		if (trackId) {

			/* In dev */
			db.getAllTrackTimings(trackId).then((result) => {

				if (!result) {
					return res.status(404).send('Not found');
				}

				let data = [];
				for (let [time, count] of Object.entries(result)) {
					time = parseInt(time);
					if (Number.isInteger(time)) {
						var entry = {
							time: (time / 100) + 's',
							rawTime: time
						};

						if (count > 1) {
							entry.count = count - 1;
						}

						data.push(entry);
					}
				}

				let timingBuckets = {};


				data = data.filter(item => {
					let rawTime = item.rawTime * 10;

					if (rawTime < 1000 || rawTime > 10000) {
						return false;
					} else {
						return true;
					}
				});

				data.forEach(timing => {
					let rawTime = timing.rawTime / 100;
					if (!timing.count) {
						return;
					} else {
						var bucket = Math.floor(rawTime).toString();
						if (timingBuckets[bucket] > 0) {
							timingBuckets[bucket] += timing.count;
						} else {
							timingBuckets[bucket] = timing.count;
						}
					}
				});

				let runningTotal = 0;
				for (let i=1; i<=10; i++) {
					runningTotal += timingBuckets[i];
					timingBuckets[i] = runningTotal;
				}

				let total = data.reduce((prev, cur, ind) => {
					if (cur.count) {
						return prev + cur.count;
					} else {
						return prev;
					}
				}, 0);


				res.send({ timingBuckets, total });

			});

		} else {
			res.status(400).send('Bad request');
		}
	});


};

module.exports = (db) => {
	startServer(db);
};
