export const GET_SHORT_CODE: string = `SELECT * FROM urls WHERE short_code = ? LIMIT 1`;

export const GET_CUSTOM_ALIAS: string = `SELECT * FROM urls WHERE custom_alias = ? LIMIT 1`;

export const CREATE_URL: string = `INSERT INTO urls 
(original_url, short_code, custom_alias, password, expires_at)
VALUES (?, ?, ?, ?, ?)`;
