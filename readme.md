
##  Leaderboard

Supports large datasets of hundreds of millions of rows.

### Expected data format

A CSV file which looks like this. Name it `data.csv`

| itemId  | milliseconds |
| ------------- | ------------- |
| 497823  | 2277 |
| 893752  | 5359 |

### Start redis

```sh
~/Downloads/redis-download/redis-stable/src/redis-server

# Optional - test server is alive
~/Downloads/redis-download/redis-stable/src/redis-cli ping
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

http://localhost:3000/allItemTimes/76223190

```json
{
    "timings": [
        {
            "time": "1s",
            "rawTime": 100,
            "count": 2
        },
        {
            "time": "1.12s",
            "rawTime": 112
        },
        {
            "time": "1.79s",
            "rawTime": 179
        },
        {
            "time": "2s",
            "rawTime": 200,
            "count": 1
        },
        {
            "time": "2.4s",
            "rawTime": 240,
            "count": 2
        },
        {
            "time": "2.5s",
            "rawTime": 250
        },
        {
            "time": "2.7s",
            "rawTime": 270,
            "count": 1
        },
        {
            "time": "2.97s",
            "rawTime": 297
        },
        {
            "time": "6.79s",
            "rawTime": 679
        }
    ]
}
```
