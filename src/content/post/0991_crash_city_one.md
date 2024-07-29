---
title: "Crash City"
publishDate: "25 March 2023"
description: "Analyzing NYC Traffic Collision Data on the Linux Command Line with SoQL and Curl"
tags: ["curl", "collision", "data", "SoQL", "Linux", "API", "CLI", "traffic", "NYC"]
ogImage: "/social-card.png"
draft: false
---

## Analyzing NYC Traffic Collision Data on the Linux Command Line with SoQL and Curl

New York City and the NYPD publish a dataset of traffic collisions, related fatalities, injuries and other details [here](https://dev.socrata.com/foundry/data.cityofnewyork.us/h9gi-nx95).
This was first published in July 2012, and is updated regularly to this date.

NYC Commuters, especially pedestrians and cyclists, have to endure many hazards just to get to and from work. Crime is one issue, but it's not as treacherous as crossing Queens Boulevard during rush hour, or cycling in downtown Manhattan when [some clown](https://www.nova.ie/wp-content/uploads/2020/05/Clown-Car.jpg) driving an SUV the size of an [Sherman tank](https://www.motorbiscuit.com/american-trucks-suvs-almost-bigger-world-war-ii-tanks/) is taking up half the road.

Previously I did some [analysis](https://www.aibistin.com/?p=907) using their downloadable CSV dataset.

Here I’m going to use the [curl](https://www.man7.org/linux/man-pages/man1/curl.1.html) utility along with the [SODA](https://docs.oracle.com/en/database/oracle/simple-oracle-document-access/rest/index.html), Socrata Query Language [SoQL](https://dev.socrata.com/docs/endpoints.html), to try and make some sense out of this published [data](https://dev.socrata.com/foundry/data.cityofnewyork.us/h9gi-nx95).

### How many collisions in New York City since July 2012

```bash
curl --get --data-urlencode "\$\$app_token=uvwxyz" --data-urlencode "\$select=count(*)" https://data.cityofnewyork.us/resource/h9gi-nx95.json
[{"count":"1977803"}]
```

#### Explanation

- `curl --get` or `-G`
  - Use the GET verb as we are ‘getting’ data
  - `v`
    - Lots of verbose output as you can see from the above output.
  - `d`
    - Request data to pass to the API in ASCII format
  - `--data-urlencode`
    - URL-Encode the data. Safer than just using `-d`
- `$$app_token`
  - Users personal authorization. Not really necessary for ad-hoc requests
  - Socrata open data API [App-Token]](<https://dev.socrata.com/docs/app-tokens.html>)
  - I replaced my actual token with ‘uvwxyz’ for fairly obvious reasons
- `"$select=count(\*)"
  - Similar to the SQL `SELECT` and SQL `count` aggregate function
  - SoQL [$select](https://dev.socrata.com/docs/queries/select.html)
  - SoQL [count](https://dev.socrata.com/docs/functions/count.html)

#### Observation

1,977,803 Collisions from July 2012 to March 2023 seems like a lot to me. You’d wonder what’s the point of driving tests if we still end up with this many collisions.

### Getting all the collision records between two arbitrary dates, June 30th 2022 to December 31 2022

This time I’ll use the `-v` switch for curl to get a much more verbose output.

```bash
> curl --get -v  --data-urlencode "\$\$app_token=xyz" --data-urlencode "\$select=*" --data-urlencode "\$where=crash_date between '2022-06-30T00:00:00.000' and '2022-12-31T00:00:00.000'"  https://data.cityofnewyork.us/resource/h9gi-nx95.json

 % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0*   Trying 52.206.68.26:443...
* Connected to data.cityofnewyork.us (52.206.68.26) port 443 (#0)
...
> GET /resource/h9gi-nx95.json?$$app_token=xyz&$select=%2A&$where=crash_date+between+%272022-06-30T00%3A00%3A00.000%27+and+%272022-12-31T00%3A00%3A00.000%27 HTTP/1.1
> Host: data.cityofnewyork.us
> User-Agent: curl/7.81.0
...
< HTTP/1.1 200 OK
....
< X-SODA2-Fields: ["crash_date","crash_time","borough","zip_code","latitude","longitude","location","on_street_name","off_street_name","cross_street_name","number_of_persons_injured","number_of_persons_killed","number_of_pedestrians_injured","number_of_pedestrians_killed","number_of_cyclist_injured","number_of_cyclist_killed","number_of_motorist_injured","number_of_motorist_killed","contributing_factor_vehicle_1","contributing_factor_vehicle_2","contributing_factor_vehicle_3","contributing_factor_vehicle_4","contributing_factor_vehicle_5","collision_id","vehicle_type_code1","vehicle_type_code2","vehicle_type_code_3","vehicle_type_code_4","vehicle_type_code_5"]
< X-SODA2-Types: ["floating_timestamp","text","text","text","number","number","location","text","text","text","number","number","number","number","number","number","number","number","text","text","text","text","text","number","text","text","text","text","text"]
< X-SODA2-Data-Out-Of-Date: false
...
{ [14733 bytes data]
...
[{"crash_date":"2022-06-30T00:00:00.000","crash_time":"14:01","cross_street_name":"101       EAST DRIVE","number_of_persons_injured":"1","number_of_p
ersons_killed":"0","number_of_pedestrians_injured":"0","number_of_pedestrians_killed":"0","number_of_cyclist_injured":"1","number_of_cyclist_killed":
"0","number_of_motorist_injured":"0","number_of_motorist_killed":"0","contributing_factor_vehicle_1":"Pedestrian/Bicyclist/Other Pedestrian Error/Con
fusion","collision_id":"4542318","vehicle_type_code1":"Bike"}
...
,{"crash_date":"2022-07-03T00:00:00.000","crash_time":"22:30","borough":"BRONX","zip_code":"10458","latitude":"40.866802","longitude":"-73.88444","location":{"latitude":"40.866802","longitude":"-73.88444","human_address":"{\"address\": \"\", \"city\": \"\", \"state\": \"\", \"zip\": \"\"}"},"on_street_name":"WEBSTER AVENUE","off_street_name":"EAST 199 STREET","number_of_persons_injured":"0","number_of_persons_killed":"0","number_of_pedestrians_injured":"0","number_of_pedestrians_killed":"0","number_of_cyclist_injured":"0","number_of_cyclist_killed":"0","number_of_motorist_injured":"0","number_of_motorist_killed":"0","contributing_factor_vehicle_1":"Driver Inattention/Distraction","contributing_factor_vehicle_2":"Unspecified","collision_id":"4543075","vehicle_type_code1":"Station Wagon/Sport Utility Vehicle","vehicle_type_code2":"Station Wagon/Sport Utility Vehicle"}]
```

#### Explanation

- 1000 records
  - When no `$limit` is set, this is the default maximum rows returned
- `curl --get` or `-G`
  - Use the GET verb as we are ‘getting’ data
  - `-v`
    - Lots of verbose output as you can see
  - `-d`
    - Request data to pass to the API in ASCII format
  - `--data-urlencode`
    - URL-Encode the data. Safer than just using `-d`
- `$$app_token`
  - Users personal authorization. Not really necessary for ad-hoc requests
- `"$select=\*"
  - Similar to an SQL `SELECT`
  - Selecting all columns. This is the default and can be omitted
  - SoQL [$select](https://dev.socrata.com/docs/queries/select.html)
- `$where`
  - Similar to SQL `WHERE` to filter down data.
  - SoQL [$where](https://dev.socrata.com/docs/queries/where.html)
- `between … and …`
  - SoQL [between](https://dev.socrata.com/docs/functions/between.html)
  - Narrow our results down to collisions between the two \*_inclusive_ ‘crash_date’ values

#### Observation

It turns out after piping this request to a `wc` command, that the API only returns 1000 rows, which is the default maximum amount if the `$limit` clause isn’t specified. With the `$limit` clause, the maximum amount that can be returned with one call is 50,000 rows. To get more, you will need to order and [page](https://dev.socrata.com/docs/paging.html) through the data.
One other thing to note here is that when using the `-v`, verbose switch, you get to see the column names and their data types.

##### The NYC dataset column names

```bash
"crash_date","crash_time","borough","zip_code","latitude","longitude","location","on_street_name","off_street_name","cross_street_name","number_of_persons_injured","number_of_persons_killed","number_of_pedestrians_injured","number_of_pedestrians_killed","number_of_cyclist_injured","number_of_cyclist_killed","number_of_motorist_injured","number_of_motorist_killed","contributing_factor_vehicle_1","contributing_factor_vehicle_2","contributing_factor_vehicle_3","contributing_factor_vehicle_4","contributing_factor_vehicle_5","collision_id","vehicle_type_code1","vehicle_type_code2","vehicle_type_code_3","vehicle_type_code_4","vehicle_type_code_5"
```

#### Corresponding Field Data Types

```bash
"floating_timestamp","text","text","text","number","number","location","text","text","text","number","number","number","number","number","number","number","number","text","text","text","text","text","number","text","text","text","text","text"
```

### SoQL [Query Clauses](https://dev.socrata.com/docs/queries/) from the Docs

| Parameter | Description                                                         | Default                                                   | In $query |
| --------- | ------------------------------------------------------------------- | --------------------------------------------------------- | :-------: |
| $select   | The set of columns to be returned, similar to a SELECT in SQL       | All columns, equivalent to $select=\*                     |  SELECT   |
| $where    | Filters the rows to be returned, similar to WHERE                   | No filter                                                 |   WHERE   |
| $order    | Column to order results on, similar to ORDER BY in SQL              | Unspecified order                                         | ORDER BY  |
| $group    | Column to group results on, similar to GROUP BY in SQL              | No grouping                                               | GROUP BY  |
| $having   | Filters the rows that result from an aggregation, similar to HAVING | No filter                                                 |  HAVING   |
| $limit    | Maximum number of results to return                                 | 1000 (2.0 endpoints: maximum of 50,000; 2.1: unlimited ») |   LIMIT   |
| $offset   | Offset count into the results to start at, used for paging          | 0                                                         |  OFFSET   |
| $q        | Performs a full text search for a value.                            | No search                                                 |    N/A    |
| $query    | A full SoQL query string, all as one parameter                      | N/A                                                       |    N/A    |
| $$bom     | Prepends a UTF-8 Byte Order Mark to the beginning of CSV output     | false                                                     |    N/A    |

### Get all the collisions for zip code 10036, Times Square NYC, for Feb 2023

Save it into file `times_square_july_2022.json`

```bash
curl --get --data-urlencode "\$\$app_token=uvwxyz"  --data-urlencode "\$select=*" / --data-urlencode "\$where=crash_date between '2023-02-01T00:00:00.000' and '2023-02-28T00:00:00.000'" --data-urlencode "zip_code=10036"  https://data.cityofnewyork.us/resource/h9gi-nx95.json >    collisions_z10036_feb_2023.json
```

#### Explanation

- "\$where=crash_date between '2023-02-01T00:00:00.000' and '2023-02-28T00:00:00.000'" --data-urlencode "zip_code=10036"
  - Specify dates between and including February 1st to the 28th.
  - `zip_code=10036` to narrow down our results.

Count how many collisions using the Linux `wc` command with our newly created file, `times_square_july_2022.json`.

```bash
wc -l collisions_z10036_feb_2023.json
25 collisions_z10036_feb_2023.json
```

Double check that count of 25 collisions, using the SoQl `count(*)` function.

```bash
> curl --get --data-urlencode "\$\$app_token=uvwxyz"  --data-urlencode "\$select=count(*)"  --data-urlencode "\$where=crash_date between '2023-02-01T00:00:00.000' and '2023-02-28T00:00:00.000'" --data-urlencode "zip_code=10036"  https://data.cityofnewyork.us/resource/h9gi-nx95.json
[{"count":"25"}]
```

#### Explanation

- `\$select=count(*)`
  - Similar to the SQL `count` function, this uses the SoQL [count](https://dev.socrata.com/docs/functions/count.html) function to count the number of rows that match our search criteria.
- `[{"count":"25"}]`, which matches the number of records in the collisions_z10036_feb_2023.json file

### Observation

25 collisions in one midtown zip code for February is almost 1 collision a day. I’m sure that's lower than many other zip codes.

### Get the 10 worst zip codes for collisions in February 2023

```bash
> curl --get --silent  ‘$$app_token=uvwxyz’  --data-urlencode "\$select=count(*), zip_code"   --data-urlencode "\$where=crash_date between '2023-02-01T00:00:00.000' and '2023-02-28T00:00:00.000'"  --data-urlencode '$group=zip_code'   https://data.cityofnewyork.us/resource/h9gi-nx95.json | jq -r '.[] | .zip_code + " " + .count' | sort  -k 2,2nr -k 1n | head -n10
11207 105
11212 85
11208 79
11226 75
11234 72
11236 72
11101 71
11203 67
11368 67
11211 62
```

#### Explanation

OK, I threw in a lot of commands here.

- "\$select=count(\*), zip_code"
  - Selecting the count and zip_code
  - SoQL [count](https://dev.socrata.com/docs/functions/count.html) function to count the number of rows that match our search criteria.
- `$group=zip_code`
  - Similar to the SQL `GROUP BY`
  - Returns aggregate rows grouped by the `zip_code`
- `jq -r '.[] | .zip_code + " " + .count'`
  - Using the very useful [jq](https://stedolan.github.io/jq/) to do additional filtering
  - `jq` bills itself as, “a lightweight and flexible command-line JSON processor”
  - I extract the zip_code and collision count for each zip code and concatenate them using the `bash` +, concatenation operator
- `sort  -k 2,2nr -k 1n`
  - Using the bash [sort](https://ss64.com/bash/sort.html) command, we do a reverse numerical sort by the second field, which is the count. We also do a numerical sort on the zip_code for zip_codes with identical collision counts
- `head -n10`
  - This gets the first 10, which are the 10 zip codes with the most collisions, starting with the very worst.

#### Observation

I could have used SoQL `$sort` and `$limit` to do some of this work, but I chose the `bash` sort, just because ...
Zip code [11207](https://www.unitedstateszipcodes.org/11207), East New York, Brooklyn, emerges as the zip with the most collisions in February.
This zip has a lot of issues with traffic safety, as you could also check [here](https://www.aibistin.com/?p=907) .
105 collisions in one month. 3.75 a day? There’s something seriously wrong there. You’d probably need some kind of armor suit just to cross the street there.

### As the queries get more complex, these one line commands start to get long and hard to manage

Curl has an option to create a config file. On a Linux system the default config is usually `~/.curlrc`. You can specify a config file with the `-K` or `--config` switch.

I created the below config file for these requests
The config file sets the NYC API URL, the $$app_token parameter, a GET request, as well as asking for verbose output

```
##### The ./.nyc_curlrc file contents
# --- NYC Collision Data ---
get
url = "https://data.cityofnewyork.us/resource/h9gi-nx95.json"
data-urlencode  =  "\$\$app_token=uvwxyz"
verbose
```

The previous example can now be rewritten to use the `.nyc_curlrc` config file. I also broke up the commands into separate lines using the bash continuation ‘\’ . Enclosing some of the commands in single quotes also means that the ‘$’ doesn’t need to be escaped.

```bash
> curl -K ./.nyc_curlrc \
 --data-urlencode '$select=count(*), zip_code' \
 --data-urlencode '$where=crash_date between "2023-02-01T00:00:00.000" and "2023-02-28T00:00:00.000"' \
 --data-urlencode '$group=zip_code'  \
  | jq -r '.[] | .zip_code + " " + .count' | sort  -k 2,2nr -k 1n | head -n10
```

This is a little more concise than the previous version, and yields the same result.

### Now to find how many cyclists and pedestrians were killed over the duration of this dataset

```bash
 curl -K ./.nyc_curlrc \
  --data-urlencode "\$select=date_extract_y(crash_date) AS year, SUM(number_of_pedestrians_killed) AS tot_pedestrians_killed, SUM(number_of_cyclist_killed) AS tot_cyclist_killed"  \
  --data-urlencode "\$group=year" \
  --data-urlencode "\$order=tot_pedestrians_killed DESC"  | jq .

  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   885    0   885    0     0   1616      0 --:--:-- --:--:-- --:--:--  1614
[
  {
    "year": "2013",
    "tot_pedestrians_killed": "176",
    "tot_cyclist_killed": "11"
  },
  {
    "year": "2016",
    "tot_pedestrians_killed": "149",
    "tot_cyclist_killed": "18"
  },
  {
    "year": "2014",
    "tot_pedestrians_killed": "133",
    "tot_cyclist_killed": "20"
  },
  {
    "year": "2015",
    "tot_pedestrians_killed": "133",
    "tot_cyclist_killed": "15"
  },
  {
    "year": "2022",
    "tot_pedestrians_killed": "132",
    "tot_cyclist_killed": "18"
  },
  {
    "year": "2019",
    "tot_pedestrians_killed": "131",
    "tot_cyclist_killed": "31"
  },
  {
    "year": "2021",
    "tot_pedestrians_killed": "129",
    "tot_cyclist_killed": "19"
  },
  {
    "year": "2017",
    "tot_pedestrians_killed": "127",
    "tot_cyclist_killed": "27"
  },
  {
    "year": "2018",
    "tot_pedestrians_killed": "123",
    "tot_cyclist_killed": "10"
  },
  {
    "year": "2020",
    "tot_pedestrians_killed": "101",
    "tot_cyclist_killed": "29"
  },
  {
    "year": "2012",
    "tot_pedestrians_killed": "72",
    "tot_cyclist_killed": "6"
  },
  {
    "year": "2023",
    "tot_pedestrians_killed": "18",
    "tot_cyclist_killed": "8"
  }
]
```

#### Explanation

- date_extract_y(crash_date) AS year
  - Will extract ‘2023’ from ‘2023-02-03T00:00:00.000’
  - SoQL [date_extract_y](https://dev.socrata.com/docs/functions/date_extract_y.html)
  - SUM(number_of_pedestrians_killed) AS tot_pedestrians_killed
    - `SUM`
      - Similar to SQL `SUM` aggregate function.
    - `AS`
      - Give these aggregate results a meaningful label
  - `$group=year` and `$order=tot_pedestrians_killed`
    - Similar to the SQL `GROUP BY` and `ORDER BY`
    - Returns aggregate rows grouped by the year they occurred.
    - Sorted having the year with most pedestrian fatalities first
  - `jq .`
    - This is the most basic [jq](https://stedolan.github.io/jq/) command
    - It just prints the JSON output in it’s default “pretty” format
  - We could have added `--silent` to the `curl` command or config file, to not print the curl download statistics.

#### Observation

        2012 and the current year, 2023,  can be omitted as both years have incomplete data.

### Run the previous query minus years 2012 and 2023

```bash
curl -K ./.nyc_curlrc   --data-urlencode '$select=date_extract_y(crash_date) AS year, SUM(number_of_pedestrians_killed) AS tot_pedestrians_killed, SUM(number_of_cyclist_killed) AS tot_cyclists_killed' \
  --data-urlencode '$where=year not in ("2012", "2023")' \
  --data-urlencode '$group=year' \
  --data-urlencode '$order=tot_pedestrians_killed DESC, tot_cyclists_killed'


[{"year":"2013","tot_pedestrians_killed":"176","tot_cyclists_killed":"11"}
,{"year":"2016","tot_pedestrians_killed":"149","tot_cyclists_killed":"18"}
,{"year":"2015","tot_pedestrians_killed":"133","tot_cyclists_killed":"15"}
,{"year":"2014","tot_pedestrians_killed":"133","tot_cyclists_killed":"20"}
,{"year":"2022","tot_pedestrians_killed":"132","tot_cyclists_killed":"18"}
,{"year":"2019","tot_pedestrians_killed":"131","tot_cyclists_killed":"31"}
,{"year":"2021","tot_pedestrians_killed":"129","tot_cyclists_killed":"19"}
,{"year":"2017","tot_pedestrians_killed":"127","tot_cyclists_killed":"27"}
,{"year":"2018","tot_pedestrians_killed":"123","tot_cyclists_killed":"10"}
,{"year":"2020","tot_pedestrians_killed":"101","tot_cyclists_killed":"29"}]
```

#### Explanation

- $where=year not in ("2012", "2023")
  - Added a `WHERE` clause to omit years 2012 and 2023 from the query
  - SoQL [not in (...)](https://dev.socrata.com/docs/functions/not_in.html)

#### Observation

Well, it’s not that safe being a pedestrian or cyclist in New York City. Checking the injury count would yield much higher numbers.

### Run a query to get a yearly total of injured pedestrians and cyclists

Our query string was getting a little bit out of hand and difficult to manage.
I created a dedicated config file, `.nyc_ped_cyc_injured_yearly_curlrc` for our next request.

#### The Config

```bash
> cat .nyc_ped_cyc_injured_yearly_curlrc
# --- NYC Collision Data - Injured List  ---
get
url = "https://data.cityofnewyork.us/resource/h9gi-nx95.json"
data-urlencode  = "\$\$app_token=uvwxyz"
data-urlencode  = "\$select=date_extract_y(crash_date) AS year, SUM(number_of_pedestrians_injured) AS tot_pedestrians_injured, SUM(number_of_cyclist_injured) AS tot_cyclists_injured"
data-urlencode  = "\$where=year not in ('2012','2023')"
data-urlencode  = "\$group=year"
data-urlencode  = "\$order=tot_pedestrians_injured DESC, tot_cyclists_injured DESC"
silent
```

#### Query using the config file

```bash
>  curl --config ./.nyc_ped_cyc_injured_yearly_curlrc
[{"year":"2013","tot_pedestrians_injured":"11988","tot_cyclists_injured":"4075"}
,{"year":"2017","tot_pedestrians_injured":"11151","tot_cyclists_injured":"4889"}
,{"year":"2018","tot_pedestrians_injured":"11123","tot_cyclists_injured":"4725"}
,{"year":"2016","tot_pedestrians_injured":"11090","tot_cyclists_injured":"4975"}
,{"year":"2014","tot_pedestrians_injured":"11036","tot_cyclists_injured":"4000"}
,{"year":"2019","tot_pedestrians_injured":"10568","tot_cyclists_injured":"4986"}
,{"year":"2015","tot_pedestrians_injured":"10084","tot_cyclists_injured":"4281"}
,{"year":"2022","tot_pedestrians_injured":"8963","tot_cyclists_injured":"5025"}
,{"year":"2021","tot_pedestrians_injured":"7503","tot_cyclists_injured":"4961"}
,{"year":"2020","tot_pedestrians_injured":"6691","tot_cyclists_injured":"5576"}]
```

#### Observation

Looks like the config file worked as expected. While the number of pedestrians injured is declining a little, the number of cyclists injured is going in the opposite direction.

### Using [jq](https://stedolan.github.io/jq/) to do additional filtering

Similar to the previous query, extract the yearly totals of injured cyclists. This time we’ll use [jq](https://stedolan.github.io/jq/) to filter the output.

```bash
> curl --config ./.nyc_ped_cyc_injured_yearly_curlrc \
  | jq -r '.[] | .year + "," + .tot_cyclists_injured' | sort -k 1n \
  | column -t -s, --table-columns=Year,CyclistsInjured
Year  CyclistsInjured
2013  4075
2014  4000
2015  4281
2016  4975
2017  4889
2018  4725
2019  4986
2020  5576
2021  4961
2022  5025
```

#### Explanation

This is similar to the previous query except I used [jq](https://stedolan.github.io/jq/) to extract the injured cyclist data only from the returned results.

- `sort -k 1n`
  - Sort the Year, numerically
- `column -t -s, --table-columns=Year,CyclistsInjured`
  - Add column headers for readability
  - The `jq` command already created comma separated results

#### Observation

2020 and 2022 were the worst years for bicyclist injuries. 2020 was a year where cycling became more popular. The injuries dropped a little in 2021, maybe because cyclists got a little scared after the slaughter in 2020. The upward trend may be returning, based on the 2022 results.

### Get the 10 worst zip codes for collisions in January 2023

Previously I got the [10 worst Zip codes for collisions in February][Get the 10 worst zip codes for collisions in February 2023]. I used some bash commands to fine tune results. Here I will use SoQL to do most of the heavy lifting.

#### Config file `.nyc_jan_coll_curlrc`

```bash
> cat .nyc_jan_coll_curlrc
# --- NYC Collision Data - January Collisions  ---
get
url = "https://data.cityofnewyork.us/resource/h9gi-nx95.json"
data-urlencode  = "\$\$app_token=uvwxyz"
data-urlencode = "\$select=zip_code,count(zip_code) AS collision_count"
data-urlencode = "\$where=crash_date between '2023-01-01' AND '2023-01-31' "
data-urlencode = "\$group=zip_code"
data-urlencode = "\$order=collision_count DESC, zip_code"
data-urlencode = "\$limit=10"
silent
```

```bash
> curl --config ./.nyc_jan_coll_curlrc \
  | jq -r '.[] | .zip_code + ", " + .collision_count' \
  | column -t -s, --table-columns=ZipCode,CollisionCount
ZipCode  CollisionCount
11207     124
11236     83
11208     82
11212     77
11203     69
11385     67
11234     66
11206     64
10002     63
11101     61
```

#### Explanation

Most of this is similar to our earlier request for February stats. This time we are using a new config file `.nyc_jan_coll_curlrc`.  
Instead of sorting the results using the bash sort, we sort using the SoQL `[$order](https://dev.socrata.com/docs/queries/order.html)`. We get the 10 worst using the `$limit` clause.

- `\$order=collision_count DESC, zip_code`
  - [Sort](https://dev.socrata.com/docs/queries/order.html) the collision count from worst to “least worst”.
  - zip_code ascending sort
- `$limit=10`
  - Get the first 10 after the sort using [$limit](https://dev.socrata.com/docs/queries/limit.html)

#### Observation

Zip Code [11207](https://www.unitedstateszipcodes.org/11207), again emerges as a collision prone area with 124 collisions in January. That’s 4 collisions a day. Every day is a regular demolition derby day in that part of Brooklyn.

## Some Perl CLI Resources

[Perldocs - perlrun](https://perldoc.perl.org/perlrun)

[Peteris Krumins has some great e-books](https://catonmat.net/books)

[Dave Cross - From one of his older posts on perl.com](https://www.perl.com/pub/2004/08/09/commandline.html/)

### Some NYC Street Resources

[SODA Developers Guide](https://dev.socrata.com/docs/endpoints.html)

### Some NYC Street Resources

[StreetsBlog NYC](https://nyc.streetsblog.org/)

[Hellgate NYC - Local NYC News](https://hellgatenyc.com/)

[Liam Quigley - Local Reporter](https://elkue.com/)

[More Liam Quigley - Twitter](https://twitter.com/_elkue)

[These Stupid Trucks are Literally Killing Us – YouTube](https://www.youtube.com/watch?v=jN7mSXMruEo)

### Me

[LinkedIn](https://www.linkedin.com/in/austin-kenny-87515311/)
[blog](https://www.aibistin.com/)
