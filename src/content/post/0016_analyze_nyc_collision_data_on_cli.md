---
title: "Analyze NYC Collision Data on Linux CLI"
description: "Analyze NYC Collision Data on the Command Line With Linux, SoQL and Perl"
publishDate: "07 April 2023"
tags: ["awk", "bash", "curl", "collision", "data", "SoQL", "Linux", "API", "CLI", "traffic", "NYC"]
draft: false
---

## Just When You Think it’s Safe to Go Outside

Statistics Relating to Traffic Collisions in New York City.

### Background

NYC publishes vehicle collision data which anyone can access using their API. You can also download this information in standard [CSV (Comma Separated Values) file format](https://data.cityofnewyork.us/Public-Safety/Motor-Vehicle-Collisions-Crashes/h9gi-nx95).
The file is fairly large, 420 MB, with almost 2 Million lines.

```bash title="CSV file downloaded from the NYPD Public Safety Site"
# all_motor_vehicle_collision_data.csv"
-rw-rw-r-- 1 austin austin 402M Mar  4 20:38 all_motor_vehicle_collision_data.csv
…
bash > wc -l all_motor_vehicle_collision_data.csv
1972886 all_motor_vehicle_collision_data.csv
```

#### The [head](https://ss64.com/bash/head.html) Command

```bash title="Display the first five records using 'head'."
bash > head -n5 all_motor_vehicle_collision_data.csv
CRASH DATE,CRASH TIME,BOROUGH,ZIP CODE,LATITUDE,LONGITUDE,LOCATION,ON STREET NAME,CROSS STREET NAME,OFF STREET NAME,NUMBER OF PERSONS INJURED,NUMBER OF PERSONS KILLED,NUMBER OF PEDESTRIANS INJURED,NUMBER OF PEDESTRIANS KILLED,NUMBER OF CYCLIST INJURED,NUMBER OF CYCLIST KILLED,NUMBER OF MOTORIST INJURED,NUMBER OF MOTORIST KILLED,CONTRIBUTING FACTOR VEHICLE 1,CONTRIBUTING FACTOR VEHICLE 2,CONTRIBUTING FACTOR VEHICLE 3,CONTRIBUTING FACTOR VEHICLE 4,CONTRIBUTING FACTOR VEHICLE 5,COLLISION_ID,VEHICLE TYPE CODE 1,VEHICLE TYPE CODE 2,VEHICLE TYPE CODE 3,VEHICLE TYPE CODE 4,VEHICLE TYPE CODE 5
09/11/2021,2:39,,,,,,WHITESTONE EXPRESSWAY,20 AVENUE,,2,0,0,0,0,0,2,0,Aggressive Driving/Road Rage,Unspecified,,,,4455765,Sedan,Sedan,,,
03/26/2022,11:45,,,,,,QUEENSBORO BRIDGE UPPER,,,1,0,0,0,0,0,1,0,Pavement Slippery,,,,,4513547,Sedan,,,,
06/29/2022,6:55,,,,,,THROGS NECK BRIDGE,,,0,0,0,0,0,0,0,0,Following Too Closely,Unspecified,,,,4541903,Sedan,Pick-up Truck,,,
09/11/2021,9:35,BROOKLYN,11208,40.667202,-73.8665,"(40.667202, -73.8665)",,,1211      LORING AVENUE,0,0,0,0,0,0,0,0,Unspecified,,,,,4456314,Sedan,,,,
```

Display the first record only with head.

```bash title="The column headers."
bash > head -n1 all_motor_vehicle_collision_data.csv
CRASH DATE,CRASH TIME,BOROUGH,ZIP CODE,LATITUDE,LONGITUDE,LOCATION,ON STREET NAME,CROSS STREET NAME,OFF STREET NAME,NUMBER OF PERSONS INJURED,NUMBER OF PERSONS KILLED,NUMBER OF PEDESTRIANS INJURED,NUMBER OF PEDESTRIANS KILLED,NUMBER OF CYCLIST INJURED,NUMBER OF CYCLIST KILLED,NUMBER OF MOTORIST INJURED,NUMBER OF MOTORIST KILLED,CONTRIBUTING FACTOR VEHICLE 1,CONTRIBUTING FACTOR VEHICLE 2,CONTRIBUTING FACTOR VEHICLE 3,CONTRIBUTING FACTOR VEHICLE 4,CONTRIBUTING FACTOR VEHICLE 5,COLLISION_ID,VEHICLE TYPE CODE 1,VEHICLE TYPE CODE 2,VEHICLE TYPE CODE 3,VEHICLE TYPE CODE 4,VEHICLE TYPE CODE 5
```

### Using Perl

```bash title="List the column names in numerical order."
bash > perl -F, -an -E '$. == 1 && say $i++ . "\t$_" for @F'  all_motor_vehicle_collision_data.csv
0 CRASH DATE
1 CRASH TIME
2 BOROUGH
3 ZIP CODE
4 LATITUDE
5 LONGITUDE
6 LOCATION
7 ON STREET NAME
8 CROSS STREET NAME
9 OFF STREET NAME
10 NUMBER OF PERSONS INJURED
11 NUMBER OF PERSONS KILLED
12 NUMBER OF PEDESTRIANS INJURED
13 NUMBER OF PEDESTRIANS KILLED
14 NUMBER OF CYCLIST INJURED
15 NUMBER OF CYCLIST KILLED
16 NUMBER OF MOTORIST INJURED
17 NUMBER OF MOTORIST KILLED
18 CONTRIBUTING FACTOR VEHICLE 1
19 CONTRIBUTING FACTOR VEHICLE 2
20 CONTRIBUTING FACTOR VEHICLE 3
21 CONTRIBUTING FACTOR VEHICLE 4
22 CONTRIBUTING FACTOR VEHICLE 5
23 COLLISION_ID
24 VEHICLE TYPE CODE 1
25 VEHICLE TYPE CODE 2
26 VEHICLE TYPE CODE 3
27 VEHICLE TYPE CODE 4
28 VEHICLE TYPE CODE 5
```

- **perl -an -E**
  - Split up the column values into array '@F'
- **-F,**
  - Specifies a **comma** field separator.
- **$. == 1**
  - The Perl special variable '$.' contains the current line number.
  - Display the first line only.
- **say $i++ . "\t$_" for @F**
  - Prints a tab separated counter variable '$i', and the corresponding column name, stored in the Perl default variable '$_'.

### Using Text::CSV

Getting records that include a zip-code and at least one injury or fatality.

```bash title="Work-file containing the zip-code, injury count, and fatality count."
3 ZIP CODE
10 NUMBER OF PERSONS INJURED
11 NUMBER OF PERSONS KILLED
```

- The previous method for splitting a comma delimited file has limitations. It cannot handle fields with embedded commas.
  - The _Street Name_ fields often have embedded commas which will throw off our column numbering.
- We can use [Text::CSV](https://metacpan.org/pod/Text::CSV) module, which has both functional and OO interfaces.
  - For one-liners, it exports a handy [csv function](https://metacpan.org/pod/Text::CSV#csv). From the Text::CSV documentation 'my $aoa = csv (in => "test.csv") or die Text::CSV_XS->error_diag;'
  - This will convert the CSV file into an array of arrays
- Modifying this example to 'csv( in => $ARGV[0], headers => qq/skip/ )'
  - The @ARGV array contains any input arguments
  - The first element $ARGV[0] will contain the input CSV file
  - We don’t need the header row, so it’ll be skipped

Text::CSV will get the correct fields from the CSV file

```bash title="The Text::CSV csv function.           "
perl -MText::CSV=csv  -E '$aofa = csv( in => $ARGV[0], headers => qq/skip/ ); ( $_->[3] =~ /^\S+$/ ) && say qq/$_->[3],$_->[10],$_->[11]/ for @{$aofa}'  all_motor_vehicle_collision_data.csv | sort -t, -k 1 -r > sorted_injured_killed_by_zip.csv
```

- Input file 'all_motor_vehicle_collision_data.csv'
- **perl -MText::CSV=csv**
  - Run the perl command with '-M' switch to load a Perl module, Text::CSV
- **Text::CSV=csv**
  - Export the ‘csv’ function from the 'Text::CSV' module.
- **( $_->[3] =~ /^\S+$/ )**
  - Use a Regular expression to only process rows that have non-blank data in the _ZIP CODE_ field.
- **say qq/$_->[3],$_->[10],$_->[11]/ for @{$aofa}**
  - Loop through the Array of Arrays '$aofa'
  - Print the contents of columns 3,10,11 followed by a line break.
- The output is piped '|' into the Linux sort command.
  - Sorting on the first field, _ZIP CODE_ and redirecting, '>'into a new file, 'sorted_injured_killed_by_zip.csv'.
  - See the [ss64.com site](https://ss64.com/bash/sort.html) for more details on the Linux sort command.
- The new file has about 1.36 Million lines.

### Using [wc](https://ss64.com/bash/wc.html)

Get a word count of the smaller work file with 'wc'.

```bash title="Get a word count with head and wc."
bash > wc -l sorted_injured_killed_by_zip.csv
1359291 sorted_injured_killed_by_zip.csv
```

```bash title="Display the first 10 records using 'head'"
bash > head -n10 sorted_injured_killed_by_zip.csv | column -t -s, --table-columns=ZipCode,#Injured,#Killed
ZipCode  #Injured  #Killed
11697    4         0
11697    3         0
11697    2         0
11697    2         0
11697    2         0
11697    1         0
11697    1         0
11697    1         0
11697    1         0
11697    1         0
```

- **wc -l**
  - Counts the number of lines in our new file
- **head -n 10**
  - Prints out the first 10 lines of the file
- **column -t -s, --table-columns=ZipCode,#Injured,#Killed**
  - [**column**](https://www.man7.org/linux/man-pages/man1/column.1.html)
  - **-t** switch will tell 'column' to print in table format.
  - **-s** switch specifies an input delimiter of ','.
  - The output is tabbed.

### List the 10 worst zip codes for injuries

```bash title="Use the file 'sorted_injured_killed_by_zip.csv', from the previous example."
perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[1]; END{say qq/$_,$h{$_}/ for keys %h}' sorted_injured_killed_by_zip.csv  | sort -nr -t, -k 2  | head -n10 | column -t -s, --table-columns=ZipCode,#Injured
ZipCode  #Injured
11207    10089
11236    7472
11203    7426
11212    6676
11226    6103
11208    6027
11234    5505
11434    5403
11233    5159
11385    4440
```

- **@a=split(q/,/,$_);**
  - As there are no embedded commas in this file we use the Perl ‘split’ function to break up the 3 CSV fields in each row into array '@a'.
- **$h{$a[0]} += $a[1];**
  - The first element of each row, _ZIP CODE_ is used as a key for Hash'%h'.
  - The value is the accumulated number of injuries for that _ZIP CODE_.
- **$h{$a[0]} += $a[1]**
  - We accumulate the second element, $[1], which contains 'NUMBER OF PERSONS INJURED'
  - We can set a value for a Hash key without checking if it exists already.
  - This is called Autovivification which is explained nicely by [The Perl Maven](https://perlmaven.com/autovivification).
- **END{say qq/$_,$h{$_}/ for keys %h}**
  - The 'END{}'block runs after all the rows are processed.
  - The keys(Zip Codes) are read and printed along with their corresponding values.
  - We could have used Perl to sort the output by the keys, or values.
    - I used the Linux [sort](https://ss64.com/bash/sort.html).
- **sort -nr -t, -k 2**
  - Will perform a numeric sort, descending on the # of people injured.
- **head -n10**
  - Will get the first 10 records printed.
- **column -t -s, --table-columns=ZipCode,#Injured**
  - The **column** command will produce a prettier output.
    - **-t** for table format.
    - **-s** to specify that the fields are comma separated
    - **--table-columns** to add column header names.

#### Observation About the 10 Worst Zip Codes for Injuries

Zip code [11207](http://www.neighborhoodlink.com/zip/11207), which encompasses East New York, Brooklyn, as well as a small portion of Southern Queens, has a lot of issues with traffic safety.

### Display the 10 worst zip codes for traffic fatalities

```bash title="Using 'sorted_injured_killed_by_zip.csv', from the previous example."
bash > perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[2]; END{say qq/$_,$h{$_}/ for keys %h}' sorted_injured_killed_by_zip.csv  | sort -nr -t, -k 2  | head -n10 | column -t -s, --table-columns=ZipCode,#Killed
ZipCode  #Killed
11236    44
11207    34
11234    29
11434    25
11354    25
11229    24
11208    24
11206    23
11233    22
11235    21
```

With a few minor adjustments, we got the worst zip codes for traffic collision fatalities

- **$h{$a[0]} += $a[2]**
  - Accumulate the third element, $[2], which contains 'NUMBER OF PERSONS KILLED'

#### Observation About the 10 Worst Zip Codes for Fatalities

- Zip code [11236](http://www.neighborhoodlink.com/zip/11236), which includes Canarsie Brooklyn is the worst for traffic fatalities according to this data.
  - Zip code **11207** is very bad for traffic fatalities, as well as being the worst for collision injuries
- These stats are not 100 percent accurate.
  - Out of 1,972,886 collision records only 1,359,291 contained Zip codes.
  - We have 613,595 records with no zip code, which were not included in the calculations.

### Display the injured/killed stats grouped by NYC Borough

Similar to how we created the 'sorted_injured_killed_by_zip.csv', we can run the following command sequence to create a new file 'sorted_injured_killed_by_borough.csv'

```bash title="Using the Text::CSV csv function."
perl -MText::CSV=csv  -E '$aofa = csv( in => $ARGV[0], headers => qq/skip/ ) ; ( $_->[2] =~ /^\S+/ ) && say qq/$_->[2],$_->[10],$_->[11]/ for @{$aofa}'  all_motor_vehicle_collision_data.csv | sort  -t, -k 3rn -k 2rn -k 1  >|  sorted_injured_killed_by_borough.csv
```

- **2 BOROUGH** - The BOROUGH field is the third column, starting from 0
- **( $_->[2] =~ /^\S+/ )**
  - Only get rows which have non blank data in the _BOROUGH_ field.
- **sort -t, -k 3rn -k 2rn -k 1**
  - I added some more precise sorting, which is unnecessary except to satisfy my curiosity.
    - [sort](https://ss64.com/bash/sort.html)
  - **-k 3rn**
    - Sort by column 3(starting @ 1), which is the fatality count field.
    - This is sorted numerically in descending order.
  - **-k 2rn**
    - When equal, the injury count is also sorted numerically, descending.
  - **-k 1**
    - The Borough is sorted in ascending order as a tiebreaker.

#### Display the first 10 rows of 'sorted_injured_killed_by_borough.csv'

```bash title="Using the 'head' and 'column' commands."
bash > head -n10 sorted_injured_killed_by_borough.csv | column -t -s, --table-columns=Borough,#Injured,#Killed
Borough        #Injured  #Killed
MANHATTAN      12        8
QUEENS         3         5
QUEENS         15        4
QUEENS         1         4
STATEN ISLAND  6         3
BROOKLYN       4         3
BROOKLYN       3         3
QUEENS         3         3
BROOKLYN       1         3
QUEENS         1         3
```

Do a sanity check to see if we got all five Boroughs.

```bash title="Using 'cut'."
cut -d, -f 1  sorted_injured_killed_by_borough.csv | sort -u
BRONX
BROOKLYN
MANHATTAN
QUEENS
STATEN ISLAND
```

- **cut -d, -f 1**
  - [cut](https://ss64.com/bash/cut.html) to split the comma delimited file records.
  - **-d,**
    - Specifies that the cut will comma delimited
  - **-f 1**
    - Get the first field from the `cut`, which is the Borough Name.
- **sort -u**
  - Sorts and prints only the unique values to STDOUT
- We got all 5 New York City boroughs in this file.

#### Display collision injuries for each borough

```bash title="Perl splits the columns and accumulates for each Borough."
bash > perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[1]; END{say qq/$_,$h{$_}/ for keys %h}' sorted_injured_killed_by_borough.csv   | sort -nr -t, -k 2 | column -t -s,
BROOKLYN       137042
QUEENS         105045
BRONX          62880
MANHATTAN      61400
STATEN ISLAND  15659
```

**Brooklyn** emerges as the Borough with the most traffic injuries.

#### Display collision fatalities for each borough

```bash title="Perl splits and accumulates for each Borough."
bash > perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[2]; END{say qq/$_,$h{$_}/ for keys %h}' sorted_injured_killed_by_borough.csv   | sort -nr -t, -k 2 | column  -J -s, --table-columns Borough,#Killed
{
   "table": [
      {
         "borough": "BROOKLYN",
         "#killed": "564"
      },{
         "borough": "QUEENS",
         "#killed": "482"
      },{
         "borough": "MANHATTAN",
         "#killed": "300"
      },{
         "borough": "BRONX",
         "#killed": "241"
      },{
         "borough": "STATEN ISLAND",
         "#killed": "88"
      }
   ]
}
```

- Similar to the Injury count by Borough, this counts all fatalities by borough and prints the output in JSON format.
- **column -J -s, --table-columns Borough,#Killed**
  - Use the **column** command with the **-J** switch, for JSON, instead of **-t** for Table.

#### Check the Dataset Date Range

I forgot to mention what date range is involved with this dataset. We can check this with the [**cut**](https://ss64.com/bash/cut.html) command

```bash title="Using 'cut' to display the collision year."
cut -d, -f1 all_motor_vehicle_collision_data.csv | cut -d/ -f3 | sort -u
2012
2013
2014
2015
2016
2017
2018
2019
2020
2021
2022
2023
```

- Get the date field, **0 CRASH DATE** which is in 'mm/dd/yyyy' format.
- **cut -d, -f all_motor_vehicle_collision_data.csv**
  - Get the first column/field of data for every row of this CSV file.
  - **-d,** specifies that we are cutting on the comma delimiters.
  - **-f 1** specifies that we want the first column/field only
    - This is the date in **mm/dd/yyyy** format.
- **cut -d/ -f3**
  - Will cut the date using **/** as the delimiter.
  - Grab the third field from this, which is the four digit year.
- **sort -u**
  - The years are then sorted with duplicates removed.

The dataset started sometime in 2012 and continues until now, March 2023.

#### Display the 20 worst days for collisions in NYC

```bash title="Using 'cut' and 'awk"
bash > cut -d, -f1 all_motor_vehicle_collision_data.csv | awk -F '/' '{print $3 "-" $1 "-" $2}' | sort | uniq -c | sort -k 1nr | head -n20 | column -t --table-columns=#Collisions,Date
#Collisions  Date
1161        2014-01-21
1065        2018-11-15
999         2017-12-15
974         2017-05-19
961         2015-01-18
960         2014-02-03
939         2015-03-06
911         2017-05-18
896         2017-01-07
884         2018-03-02
883         2017-12-14
872         2016-09-30
867         2013-11-26
867         2018-11-09
857         2017-04-28
851         2013-03-08
851         2016-10-21
845         2017-06-22
845         2018-06-29
841         2018-12-14
```

- Get a count for all collisions for each date on record
- Display the first 20 with the highest collision count
- [**cut**](https://ss64.com/bash/cut.html)
  - Get the first column from the dataset.
  - Pipe this date into the [awk](https://ss64.com/bash/awk.html) command.
  - AWK is a very useful one-liner tool as well as being a full scripting language.
- **awk -F '/' '{print $3 "-" $1 "-" $2}**
  - **-F '/'**
    - Split the date into separate fields using the **/** as a delimiter.
    - $1 contains the month value, $2 contains the day of month and $3 contains the four digit year value.
    - These will be printed in the format **yyyy-mm-dd**.
- Dates are then sorted and piped into the [uniq](https://ss64.com/bash/uniq.html) command.
- **uniq -c**
  - Will create a unique output.
  - **-c** switch gets a count of all the occurrences for each value.
- The output is piped into another sort command, which sorts by the number of occurrences descending.

#### Observation About Collision Dates

There is no obvious explanation as to why some days have a lot more collisions than others. Weatherwise, January 21 2014 was a cold day, but otherwise uneventful. November 15 2018 had some snow, but not a horrific snowfall. The clocks went back on November 4, so that wouldn’t be a factor.

- [2014-01-21 weather](https://www.wunderground.com/history/daily/us/ny/new-york-city/KLGA/date/2014-1-21)
- [2018-11-15 weather](https://www.wunderground.com/history/daily/us/ny/new-york-city/KLGA/date/2018-11-15)

### The Twenty Worst Times of Day for Collisions

```bash title="Using 'cut', 'sort',  'uniq', 'head' and 'column'."
bash > cut -d, -f2 all_motor_vehicle_collision_data.csv | sort | uniq -c | sort -k 1nr | head -n20 |column -t  --table-columns=#Collisions,Time
#Collisions  Time
27506       16:00
26940       17:00
26879       15:00
24928       18:00
24667       14:00
22914       13:00
20687       9:00
20641       12:00
20636       19:00
19865       16:30
19264       8:00
19107       10:00
19106       14:30
19010       0:00
18691       11:00
18688       17:30
16646       18:30
16602       20:00
16144       8:30
16008       13:30
```

Group the collisions by the **hour of day** to give a 60 minute time frame.

### Display the Hour of Day Counts for Each Collision

```bash title="Use the time field, '1 CRASH TIME', which is in 24 hour format, 'HH:MM'."
 bash > cut -d, -f2 all_motor_vehicle_collision_data.csv | cut -d : -f1 | sort | uniq -c | sort -k 1nr | head -n10 | column -t --table-columns=#Collisions,Hour
#Collisions  Hour
143012      16
139818      17
132443      14
123761      15
122971      18
114555      13
108925      12
108593      8
105206      9
102541      11
```

- Similar to the previous example, except this time the [cut](https://ss64.com/bash/cut.html) command is used to split the time HH:MM, delimited by ':'
- **cut -d : -f 1**
  - **-d**
    - The 'cut' delimiter is ':'
  - **-f 1**
    - Grab the first field, 'HH' of the 'HH:MM'.
- Use something like the [printf](https://ss64.com/bash/printf.html) command to append ':00' to those hours.

As you would expect, most collisions happen during rush hour.

### The Worst Years for Collisions

```bash title="Using cut, sort, uniq, head and column."
bash > cut -d, -f1 all_motor_vehicle_collision_data.csv | cut -d '/' -f3 | sort | uniq -c | sort -k 1nr | head -n10 | column -t --table-columns=#Collisions,Year
#Collisions  Year
231564       2018
231007       2017
229831       2016
217694       2015
211486       2019
206033       2014
203734       2013
112915       2020
110546       2021
103745       2022
```

- We use the first column, **0 CRASH DATE** again
- **cut -d '/' -f3**
  - Extracts the 'yyyy'from the 'mm/dd/yyyy'

#### Observation About the Yearly Collision Trends

- There is some improvement seen in 2020, 2021 and 2022, if you can believe the data.
- By only printing out the worst 10 years, partial years 2012 and 2023 were excluded.

### Create a CSV File of Sorted Injuries and Deaths

Work file, **sorted_injured_killed_by_year.csv**, with three columns, **Year**, **Injured count** and **Fatality count**.

We need the [Text::CSV](https://metacpan.org/pod/Text::CSV) Perl module here due to those embedded commas in earlier fields. Below are the three fields needed.

```ansi title="The Three Required Fields."
0 CRASH DATE
10 NUMBER OF PERSONS INJURED
11 NUMBER OF PERSONS KILLED
```

### The Worst Years for Collision Injuries

```bash title="Perl does the accumulation and sorting here."
perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[1]; END{say qq/$_,  $h{$_}/ for sort {$h{$b} <=> $h{$a} } keys %h}' sorted_injured_killed_by_year.csv | head -n10 |  column  -t -s, --table-columns=Year,#Injured
Year  #Injured
2018    61941
2019    61389
2017    60656
2016    60317
2013    55124
2022    51883
2021    51780
2015    51358
2014    51223
2020    44615
```

- This is similar to how we got the Zip Code and Borough data previously.
- This time the **Perl sort** is used instead of the Linux sort.
  - **END{say qq/$_,  $h{$_}/ for sort {$h{$b} <=> $h{$a} } keys %h}**
  - **for** statement loops through the '%h' hash keys(years).
  - The corresponding hash values(Injured count), are sorted in descending order.
  - **sort {$h{$b} <=> $h{$a} }**
  - **$a** and **$b** are default Perl sort variables.
  - Rearranged it to **sort {$h{$a} <=> $h{$b} }**, to sort the injury count in ascending order.

While the collision count may have gone down, there isn't any real corresponding downward trend in injuries.

### The Worst Years for Collision Fatalities

```bash title="Perl does the accumulation and sorting here."
bash > perl -n -E '@a=split(q/,/,$_);$h{$a[0]} += $a[2]; END{say qq/$_,  $h{$_}/ for sort {$h{$b} <=> $h{$a} } keys %h}' sorted_injured_killed_by_year.csv | head -n10 |  column  -t -s, --table-columns=Year,#Killed
Year  #Killed
2013    297
2021    294
2022    285
2020    268
2014    262
2017    256
2016    246
2019    244
2015    243
2018    231
```

- Slightly modified version of the injury by year count.

As with the injuries count, there isn't any real corresponding downward trend in traffic collision fatalities.

## Conclusion

There’s lots more work that can be done to extract meaningful information from this dataset.  
What’s clear to me, is that all the political rhetoric and money poured into [**Vision Zero**](https://www.nyc.gov/content/visionzero/pages/) has yielded little in terms of results.
Most of the solutions are obvious from a logical point of view, but not a political point of view. I walk and cycle these streets and know how dangerous it is to cross at the “designated” crosswalks when cars and trucks are turning in on top of you. Cycling in NYC is even worse.

### Sugggested solutions

- Delayed green lights co cars cars don't turn in on pedestrians at crosswalks.
- Much higher tax and registraton fees for giant SUV's and pickup trucks. The don’t belong in the city.
- Better bike lanes, instead of meaningless lines painted on the road.
  - Many bike lanes are used as convenient parking for NYPD and delivery vehicles.
- Basic enforcement of traffic laws, which isn't being done now.
  - Drivers ignore red lights, speed limits, noise restrictions etc. when they know they aren't being enforced.
  - Driving while texting or yapping on the phone is the norm, not the exception.
- Drastically improve public transit, especially in areas not served by the subway system.

#### Some Perl CLI Resources

[Perldocs - perlrun](https://perldoc.perl.org/perlrun)  
[Peteris Krumins has some great e-books](https://catonmat.net/books)  
[Dave Cross - From one of his older posts on perl.com](https://www.perl.com/pub/2004/08/09/commandline.html/)  

#### More NYC Traffic Info

[SODA Developers Guide](https://dev.socrata.com/docs/endpoints.html)  
[NYC Open Data](https://opendata.cityofnewyork.us/)  
[NYC Streetsblog](https://nyc.streetsblog.org/)  
[Hellgate NYC - Local NYC News](https://hellgatenyc.com/)  
[Liam Quigley - Local Reporter](https://elkue.com/)  
[More Liam Quigley - Twitter](https://twitter.com/_elkue)  
[These Stupid Trucks are Literally Killing Us – YouTube](https://www.youtube.com/watch?v=jN7mSXMruEo)  

### Me

[LinkedIn](https://www.linkedin.com/in/austin-kenny-87515311/)
