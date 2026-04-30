const GET_SHORT_CODE: string = `
SELECT *
FROM resources
WHERE short_code = ?
LIMIT 1`;

const CREATE_RESOURCE: string = `
INSERT INTO resources (
  id,
  user_id,
  short_code,
  original_url,
  resource_type,
  activate_at,
  expires_at,
  password_hash,
  password_salt
)
VALUES (
  UUID_SHORT(),
  ?,
  ?,
  ?,
  ?,
  ?,
  ?,
  NULL,
  NULL
)`;

const GET_RESOURCE_BY_ID: string = `
SELECT *
FROM resources
WHERE id = ?
LIMIT 1`;

const ResourceQueries = {
  GET_SHORT_CODE,
  CREATE_RESOURCE,
  GET_RESOURCE_BY_ID,
};

export default ResourceQueries;
