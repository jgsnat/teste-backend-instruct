const Sequelize = require('sequelize');
const { 
    DB_DATABASE, 
    DB_USER, 
    DB_PASSWORD, 
    DB_HOST, 
    DB_DIALECT, 
    DB_PORT 
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

exports.sequelizeInstance = sequelizeInstance;
exports.Sequelize = Sequelize;