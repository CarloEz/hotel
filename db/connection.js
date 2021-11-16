const { createPool } = require('mysql');
const { promisify } = require('util');
require('dotenv').config();

const { DB_HOST, DB_USER, DB_PWD, DB_PORT, DB_NAME } = process.env;

const pool = createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB_NAME,
    port: DB_PORT,
    connectionLimit: 10
})

const getquery = promisify(pool.query).bind(pool);

module.exports = getquery;