## Leaderboard

[![Actions Status](https://github.com/umaar/leaderboard/workflows/Node%20CI/badge.svg)](https://github.com/umaar/leaderboard/actions)

### What is this:

This tool supports leaderboard functionality, where you may have hundreds of millions of rows.

### Example use case:

You have a popular game where players complete levels. This Node.js application can store the time it took players to complete such levels, and then respond with a leaderboard for a particular level, and also the relative ranking for a particular score. This allows you to show messages like:

> You completed this level in 45sec. You are position 3 in the leaderboard (out of 244k)!

Or:

> You scored better than 85% of users.

### What can you do exactly?

-   Ingest a large dataset of scores/metrics upon app startup
-   Insert metrics over HTTP, while the web server is up and running
-   Retrieve all metrics for a given item, in grouped/bucketed form (useful for large datasets)
-   Given a particular item, retrieve its position in a leaderboard, relative to all other scores
-   Retrieve results in < 1 second, even with hundreds of millions of entries, thanks to Redis

This web server lets you create a fast and responsive leaderboard even with hundreds of millions of 'scores'. Say you have a `data.csv` file which looks like this:

| itemId | milliseconds |
| ------ | ------------ |
| 00001  | 2100         |
| 00001  | 3042         |
| 00001  | 2277         |
| 00002  | 544          |
| 00002  | 2992         |
| 00003  | 1500         |
| 00004  | 4010         |

Milliseconds can represent any metric you're interested in, e.g. the time it took to click a button, the length of time a user stayed on your page.

Once this tool ingests your data, you can then perform queries on `itemId`'s, (`itemId` could represent a movie, a blog post etc.) to discover it's ranking within a leaderboard. E.g. A query for item `0001` may return:

```json
{
    "position": 2,
    "total": 3
}
```

### To get started

#### Start redis

Install redis:

```sh
brew install redis
```

```sh
redis-server

# Optional - test server is alive, in a new terminal
redis-cli ping
```

#### Start the web server

```sh
npm i
make start

# You can insert data with this.

curl --data 'time=8800&itemId=Your_Item_ID_Here' 0.0.0.0:3000/itemTime

# The response of the insertion is a JSON object informing of the items relative position in the leaderboard

# You can also get all times for an item at: http://localhost:3000/allItemTimes/Your_Item_ID_Here

# Also see: http://localhost:3000/stats/Your_Item_ID_Here

# Also see: http://localhost:3000/allItemTimes/Your_Item_ID_Here?currentTime=1689 - After you've inserted your record, the `currentTime` query param will indicate in the response which record is the one you're interested in (a `currentScrore: true`)
```

### Using the redis CLI

```sh
# Get the count of timings within the 1000ms bucket for the item Your_Item_ID_Here
HGET Your_Item_ID_Here 100

# Get the total count of recorded timings for the item Your_Item_ID_Here
HGET Your_Item_ID_Here total

# See all data stored for a particular item
HGETALL Your_Item_ID_Here
```
