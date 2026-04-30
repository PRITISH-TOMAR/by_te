const GET_COUNTER_FROM_DB = `
SELECT counter
FROM global_counter
WHERE id = 1
FOR UPDATE`;

const UPDATE_COUNTER_IN_DB = `
UPDATE global_counter
SET counter = ?
WHERE id = 1`;

const UPSERT_COUNTER_IN_DB = `
INSERT INTO global_counter (id, counter)
VALUES (1, ?)
ON DUPLICATE KEY UPDATE counter = GREATEST(counter, VALUES(counter))`;

const BatchQueries = {
  GET_COUNTER_FROM_DB,
  UPDATE_COUNTER_IN_DB,
  UPSERT_COUNTER_IN_DB,
};
export default BatchQueries;
