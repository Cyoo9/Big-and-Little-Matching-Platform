DROP TABLE IF EXISTS users CASCADE;


------------
---TABLES---
------------
CREATE TABLE users
(
	id SERIAL,
	name VARCHAR(255),
	biglittle VARCHAR(255),
	hobbylist VARCHAR(255),
	yr VARCHAR(255),
	major VARCHAR(255), 
	email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    seeking VARCHAR(255),
    external_id VARCHAR(255),
	PRIMARY KEY (id)
);


