const { Model, DataTypes } = require('sequelize');
const { sequelizeInstance } = require('../configs/database');

class Counties extends Model {};

Counties.init(
    {
        code: {
            type: DataTypes.INTEGER(7),
            allowNull: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(45),
            allowNull: false            
        }
    }, {
        sequelize: sequelizeInstance
    }
);

module.exports = Counties;