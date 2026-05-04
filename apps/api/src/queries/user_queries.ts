const GET_USER_BY_EMAIL: string = `
SELECT *
FROM users
WHERE email = ?
LIMIT 1`;

const GET_USER_BY_ID: string = `
SELECT *
FROM users
WHERE id = ?
LIMIT 1`;

const CREATE_USER: string = `
INSERT INTO users (
  email,
  password_hash,
  password_salt
)
VALUES (
  ?,
  ?,
  ?
)`;

const UserQueries = {
  GET_USER_BY_EMAIL,
  GET_USER_BY_ID,
  CREATE_USER,
};

export default UserQueries;
