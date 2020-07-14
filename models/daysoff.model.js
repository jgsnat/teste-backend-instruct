const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');

class DaysOff extends Model {};

DaysOff.init(
    {
        day: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        month: {
            type: DataTypes.STRING(2),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        national: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize: sequelizeInstance,
        modelName: 'days_off',
        freezeTableName: true
    }
);

module.exports = DaysOff;