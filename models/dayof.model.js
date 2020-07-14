const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');

class DayOf extends Model {};

DayOf.init(
    {
        date: {
            type: DataTypes.DATE('yyyy-MM-dd'),
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(70),
            allowNull: false
        },
        national: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize: sequelizeInstance
    }
);

module.exports = DayOf;