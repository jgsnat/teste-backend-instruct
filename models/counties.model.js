const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');

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

module.exports = Counties;