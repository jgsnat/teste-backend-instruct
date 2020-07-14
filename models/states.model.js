const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');
const DaysOff = require('./daysoff.model');

class States extends Model {};

States.init(
    {
        prefix: {
            type: DataTypes.INTEGER,
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
        sequelize: sequelizeInstance,
        modelName: 'state'
    }
);

DaysOff.belongsTo(States, {
    as: 'states',
    foreignKey: 'states_prefix',
    targetKey: 'prefix'
});

module.exports = States;