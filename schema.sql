use delta_app;

create table vs_sql(
    name VARCHAR(30) PRIMARY KEY,
    id INT
);

INSERT INTO vs_sql
(name, id)
VALUES
("shaheen",12);

SELECT *FROM vs_sql;

USE delta_app;

CREATE TABLE abdullah(
    id VARCHAR(40) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);
