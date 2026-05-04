const GET_SHORT_CODE: string = `
SELECT *
FROM resources
WHERE short_code = ?
LIMIT 1`;

const CREATE_RESOURCE: string = `
INSERT INTO resources (
  counter_id,
  short_code,
  original_url,
  resource_type,
  activate_at,
  expires_at,
  password_hash,
  password_salt
)
VALUES (
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

const INSERT_QR_CODE_LINK: string = `
INSERT INTO qr_code_url (
  short_code, 
  url
)
VALUES (
  ?,
  ?
)`;


const ResourceQueries = {
  GET_SHORT_CODE,
  CREATE_RESOURCE,
  GET_RESOURCE_BY_ID,
  INSERT_QR_CODE_LINK,
};

export default ResourceQueries;
