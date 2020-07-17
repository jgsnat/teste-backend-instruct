const Sequelize = require('sequelize');
const { 
    DB_DATABASE, 
    DB_USER, 
    DB_PASSWORD, 
    DB_HOST, 
    DB_DIALECT, 
    DB_PORT,
    HEROKU_POSTGRESQL_BRONZE_URL 
} = require('../utils/constant');
const sequelizeInstance = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    pool: {
        max: 9,
        min: 0,
        idle: 10000
    }
});

// Using for deploy on Heroku
/*const sequelizeInstance = new Sequelize(HEROKU_POSTGRESQL_BRONZE_URL, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    protocol: DB_DIALECT
});*/

exports.sequelizeInstance = sequelizeInstance;
exports.Sequelize = Sequelize;