---
title: "Inserting Data to a PostgreSQL Table With Python"
description: "Inserterting NYC street names into a PostgreSQL table with Python"
publishDate: "30 May 2020"
tags: ["python", "sql", "postgresql", "psycopg2", "pytest", "traffic", "street", "data", "NYC"]
draft: false
---

## Getting started with Python and psycopg2

### Inserting a Table Row and Returning the Primary Key Id

The Primary Key Id will be returned whether the row already exists or not.  
This could also be easily be achieved with a PostgreSQL Trigger function.

```sql title="Sample 'street' table"
DROP TABLE IF EXISTS crash.street;

CREATE TABLE crash.street (
id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
name TEXT NOT NULL,
borough_code VARCHAR (2) NOT NULL,
zip_code VARCHAR (5),
create_date timestamp with time zone DEFAULT now(),
update_date timestamp with time zone DEFAULT now(),
CONSTRAINT s_nbz_u UNIQUE (name, borough_code, zip_code)
);
```

&nbsp;

```python title="Module 'collision_db.py', contains all functions for interacting with the database."
import psycopg2
import psycopg2.extras
import os, sys

def log_this(msg):
    print(f'{os.path.basename(__file__)}: {sys._getframe().f_back.f_lineno}> {msg}')

def get_db_connection():
    c = None
    my_schema = 'crash' # Set the search path so I don't have to specify # 'crash' schema in the SQL
    search_path = f'-c search_path=pg_catalog,public,{my_schema}'
    try:
        c = psycopg2.connect(
            database='nyc_data',
            user='postgres',
            password='xyz',
            options=search_path, )
    except psycopg2.DatabaseError as e:
        log_this(f'Error {e})')
        sys.exit(99)
    # Not using commits and rollbacks for this test
    c.autocommit = True
    return c

...

def insert_into_street(*, con, street):
    street_id = None
    cur = con.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute(
    "SELECT id FROM street WHERE name=%(name)s AND borough_code=%(borough_code)s AND zip_code=%(zip_code)s",
    street)
    log_this(f'Cursor status: {cur.statusmessage}')
    log_this(f'Cursor desc: {cur.description}')

    if cur.statusmessage == 'SELECT 0':
        log_this(f"Inserting new street {street}")
        cur.execute(
            "INSERT INTO street (name, borough_code, zip_code) VALUES ( %(name)s, %(borough_code)s, %(zip_code)s) RETURNING id",
            street)

    street_id = cur.fetchone()[0]
    return street_id


def delete_from_table(*, con, table_name, id):
    cur = con.cursor()
    sql = f"DELETE FROM {table_name} WHERE id = %s"
    cur.execute(sql, (id,))
    return cur.rowcount
```

&nbsp;

```python title="Focus on the 'insert_into_street' function"

def insert_into_street(*, con, street):
    street_id = None
    cur = con.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cur.execute(
    "SELECT id FROM street WHERE name=%(name)s AND borough_code=%(borough_code)s AND zip_code=%(zip_code)s",
    street)
    log_this(f'Cursor status: {cur.statusmessage}')
    log_this(f'Cursor desc: {cur.description}')

    if cur.statusmessage == 'SELECT 0':
        log_this(f"Inserting new street {street}")
        cur.execute(
            "INSERT INTO street (name, borough_code, zip_code) VALUES ( %(name)s, %(borough_code)s, %(zip_code)s) RETURNING id",
            street)

    street_id = cur.fetchone()[0]
    return street_id
```

'insert_into_street' is given a dictionary of street data.

```python title="Example street record"
    expect_street = {
        'name': 'Dead End Street',
        'borough_code': 'q',
        'zip_code': '11111'}
```

The function first checks if the street exists already. If it returns 0 rows, it inserts the the new street data using the PostgreSQL "RETURNING id".
The cursor will now contain the 'id' value either from the select or the insert. This id will be returned by the function.

To test this out I created a **_Pytest_** function that calls the insert function twice with the same data.
Both times it should return with the same row id. It should be noted that the 'get_db_connection' function
sets the Auto-commit to true.

```python
        c.autocommit = True
        return c
```

### Test the Code With Pytest

```python title="Pytest script to test inserting duplicates to the table"
import psycopg2
import pytest

from collision_db import delete_from_table, get_db_connection, insert_into_street
CON = None

...

def setup_function():
    global CON
    CON = get_db_connection()
    log_this("In setup!")

def teardown_function():
    global CON
    CON.close()
    log_this("In teardown!")

...

def test_insert_into_street_returns_street_id():
    global CON
    test_street = {
    'name': 'dead_end',
    'borough_code': 'm',
    'zip_code': '11111'}
    street_id_1 = insert_into_street(con=CON, street=test_street)
    assert street_id_1 > 0
    street_id_2 = insert_into_street(con=CON, street=test_street)
    assert street_id_1 == street_id_2
    row_ct = delete_from_table(con=CON, table_name='street', id=street_id_2)
    assert row_ct == 1
```

&nbsp;

```bash title="Run test in noisy mode with -v and -s switches"
λ pytest test_collision_db_1.py::test_insert_into_street_returns_street_id -v -s
==================================================================== test session starts ==================================================================== platform win32 -- Python 3.7.2, pytest-5.4.2, py-1.8.1, pluggy-0.13.1 -- c:\python37\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\ak1\Apps\Python\collision\tests
collected 1 item

test_collision_db_1.py::test_insert_into_street_returns_street_id test_collision_db_1.py: 25> In setup!
collision_db.py: 45> Cursor status: SELECT 0
collision_db.py: 46> Cursor desc: (Column(name='id', type_code=23),)
collision_db.py: 49> Inserting new street {'name': 'dead_end', 'borough_code': 'm', 'zip_code': '11111'}
collision_db.py: 45> Cursor status: SELECT 1
collision_db.py: 46> Cursor desc: (Column(name='id', type_code=23),)
PASSED
test_collision_db_1.py: 30> In teardown!
===================================================================== 1 passed in 0.19s =====================================================================
```

&nbsp;

```bash title="Run the same test in quiet mode"

λ pytest test_collision_db_1.py::test_insert_into_street_returns_street_id
==================================================================== test session starts ====================================================================
platform win32 -- Python 3.7.2, pytest-5.4.2, py-1.8.1, pluggy-0.13.1
rootdir: C:\Users\ak1\Apps\Python\collision\tests
collected 1 item
test_collision_db_1.py . [100%]
===================================================================== 1 passed in 0.14s =====================================================================
```

All tests passed. Outstanding!

### Conclusion

Inserting table rows and returning the Primary key is straightforward with Python and PostgreSQL
This is something I would normally execute using SQL Trigger function. However there may be cases where the above method may be more suitable.
