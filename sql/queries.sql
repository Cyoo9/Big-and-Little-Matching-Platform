DROP TABLE IF EXISTS users CASCADE;


------------
---TABLES---
------------
CREATE TABLE users
(
	id SERIAL,
	name VARCHAR(255) NOT NULL,
	biglittle VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    seeking VARCHAR(255),
    external_id VARCHAR(255),
	PRIMARY KEY (id)
);


