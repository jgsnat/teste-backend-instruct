const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');
const DaysOff = require('./daysoff.model');

class Counties extends Model {};

Counties.init(
    {
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(80),
            allowNull: false            
        }
    }, {
        sequelize: sequelizeInstance,
        modelName: 'counties'
    }
);

DaysOff.belongsTo(Counties, {
    as: 'counties',
    foreignKey: 'counties_code',
    targetKey: 'code'
});

module.exports = Counties;