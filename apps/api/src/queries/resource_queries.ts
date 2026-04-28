const GET_SHORT_CODE: string = `SELECT * FROM urls WHERE short_code = ? LIMIT 1`;

const GET_CUSTOM_ALIAS: string = `SELECT * FROM urls WHERE custom_alias = ? LIMIT 1`;

const CREATE_URL: string = `INSERT INTO urls 
(original_url, short_code, custom_alias, password, expires_at)
VALUES (?, ?, ?, ?, ?)`;

const GET_URL_BY_SHORT_CODE: string =  `SELECT * FROM urls WHERE short_code = ? LIMIT 1`;

export const SAVE_SERVER_BATCH = `
  INSERT INTO server_batches (server_ip, batch_start, batch_end)
  VALUES (?, ?, ?)
  ON DUPLICATE KEY UPDATE
    batch_start = VALUES(batch_start),
    batch_end   = VALUES(batch_end),
    updated_at  = CURRENT_TIMESTAMP
`;

export const GET_SERVER_BATCH = `
  SELECT * FROM server_batches
  WHERE server_ip = ?
  ORDER BY updated_at DESC
  LIMIT 1
`;



const ResourceQueries = { GET_CUSTOM_ALIAS, GET_SHORT_CODE, CREATE_URL, GET_URL_BY_SHORT_CODE}

export default ResourceQueries;
