const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');

class States extends Model {};

States.init(
    {
        prefix: {
            type: DataTypes.INTEGER(2),
            allowNull: false,
            primaryKey: true
        },
        initials: {
            type: DataTypes.STRING(2),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING(35),
            allowNull: false
        }
    }, {
        sequelize: sequelizeInstance
    }
);

module.exports = States;