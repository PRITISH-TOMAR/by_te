CREATE TABLE IF NOT EXISTS global_counter (
  id INT PRIMARY KEY,
  counter BIGINT NOT NULL
);

INSERT INTO global_counter (id, counter)
VALUES (1, 0)
ON DUPLICATE KEY UPDATE counter = counter;
