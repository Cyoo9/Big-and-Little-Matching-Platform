DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS COMMENTS CASCADE;


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
    external_id VARCHAR(255),
	reputation VARCHAR(255),
	numlikes INTEGER,
	PRIMARY KEY (id)
);

CREATE TABLE like_users(
	userid INTEGER,
	user_liked_email VARCHAR(255),
	FOREIGN KEY (userid) REFERENCES users(id)
);

CREATE TABLE matches (
	userid INTEGER,
	match_user_email VARCHAR(255),
	match_user_name VARCHAR(255),
	match_user_biglittle VARCHAR(255),
	FOREIGN KEY (userid) REFERENCES users(id)
)

CREATE INDEX user_id_index ON users USING BTREE(id);
CREATE INDEX user_name_index ON users USING BTREE(name);
CREATE INDEX user_biglittle_index ON users USING BTREE(biglittle);
CREATE INDEX user_hobbylist_index ON users USING BTREE(hobbylist);
CREATE INDEX user_yr_index ON users USING BTREE(yr);
CREATE INDEX user_major_index ON users USING BTREE(major);
CREATE INDEX user_email_index ON users USING BTREE(email);
CREATE INDEX user_password_index ON users USING BTREE(password);
CREATE INDEX user_external_id_index ON users USING BTREE(external_id);
CREATE INDEX user_reputation_index ON users USING BTREE(reputation);
CREATE INDEX user_numlikes_index ON users USING BTREE(numlikes);

CREATE INDEX like_users_userid_index ON like_users USING BTREE(userid);
CREATE INDEX like_users_index ON like_users USING BTREE(user_liked_email);

CREATE INDEX matches_userid_index ON matches USING BTREE(userid);
CREATE INDEX match_user_email_index ON matches USING BTREE(match_user_email);
CREATE INDEX match_user_name_index ON matches USING BTREE(match_user_name);
CREATE INDEX match_user_biglittle_index ON matches USING BTREE(match_user_biglittle);












