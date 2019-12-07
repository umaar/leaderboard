
### Leaderboard

[![Actions Status](https://github.com/umaar/leaderboard/workflows/Node%20CI/badge.svg)](https://github.com/umaar/leaderboard/actions)

Supports large datasets of hundreds of millions of rows.

### Expected data format

This web server lets you create a fast and responsive leaderboard even with hundreds of millions of 'scores'. Say you have a `data.csv` file which looks like this:

| itemId  | milliseconds |
| ------------- | ------------- |
| 00001  | 2100 |
| 00001  | 3042 |
| 00001  | 2277 |
| 00002  | 544 |
| 00002  | 2992 |
| 00003  | 1500 |
| 00004  | 4010 |

Milliseconds can represent any metric you're interested in, e.g. the time it took to click a button, the length of time a user stayed on your page. Or it can be something else entirely, e.g. view counts for a given blog post.

#### To get started

##### Start redis

```sh
~/Downloads/redis-download/redis-stable/src/redis-server

# Optional - test server is alive
~/Downloads/redis-download/redis-stable/src/redis-cli ping
```

##### Start the web server

```sh
npm i
npm start

# test it with:

curl --data 'time=8800&itemId=Your_Item_ID_Here' 0.0.0.0:3000/itemTime

# You can also get all times for an item at: http://localhost:3000/allItemTimes/Your_Item_ID_Here
```

### Using the redis CLI

```sh
# Get the count of timings within the 1000ms bucket for the item 76223190
HGET 76223190 100

# Get the total count of recorded timings for the item 76223190
HGET 76223190 total

# See all data stored for a particular item
HGETALL 76223190
```
