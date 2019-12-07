import Redis from 'ioredis';

const redis = new Redis();

export default {
	getDBInstance() {
		return this;
	},

	incrementItemTime(itemId, time) {
		return redis.hincrby(itemId, time, 1);
	},

	incrementTotal(itemId) {
		return redis.hincrby(itemId, 'total', 1);
	},

	getAllItemTimings(itemId) {
		return redis.hgetall(itemId);
	},

	flushdb() {
		return redis.flushdb();
	},

	getItemCount(itemId) {
		return redis.hget(itemId, 'total');
	},

	insertEntry([milliseconds, itemId]) {
		return Promise.all([
			this.incrementItemTime(itemId, milliseconds).then(() => [milliseconds, itemId]),
			this.incrementTotal(itemId)
		]);
	}
};
