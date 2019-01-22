/* global module */
/* jshint esnext:true */

'use strict';

var Redis = require('ioredis');
var redis = new Redis();

module.exports = {
	getDBInstance() {
		return this;
	},

	incrementTrackTime(trackId, time) {
		return redis.hincrby(trackId, time, 1);
	},

	incrementTotal(trackId) {
		return redis.hincrby(trackId, 'total', 1);
	},

	getAllTrackTimings(trackId) {
		return redis.hgetall(trackId);
	},

	flushdb() {
		return redis.flushdb();
	},

	getTrackCount (trackId) {
		return redis.hget(trackId, 'total');
	},

	insertEntry([time, trackId]) {
		return Promise.all([
			this.incrementTrackTime(trackId, time).then(() => [time, trackId]),
			this.incrementTotal(trackId)
		]);
	}
};
