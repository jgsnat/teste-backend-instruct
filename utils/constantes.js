require('dotenv').config();

const {
    APPLICATION_PORT,
    DB_HOST,
    DB_USER,
    DB_DATABASE,
    DB_PASSWORD,
    DB_PORT, 
    DB_DIALECT 
} = process.env;

exports.APPLICATION_PORT = APPLICATION_PORT;
exports.DB_HOST = DB_HOST;
exports.DB_USER = DB_USER;
exports.DB_DATABASE = DB_DATABASE;
exports.DB_PASSWORD = DB_PASSWORD;
exports.DB_PORT = DB_PORT;
exports.DB_DIALECT = DB_DIALECT;