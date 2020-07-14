const States = require('../models/states.model');
const Counties = require('../models/counties.model');
const neatCsv = require('neat-csv');
const fs = require('fs');

const initDbStates = async () => {
    let savedStates = await States.findAll();

    if (savedStates.length === 0) {
        await fs.readFile(`${__dirname}/estados-2019.csv`, async (err, data) => {
            if (err) {
                console.error(err);
                return
            }
    
            let states = await neatCsv(data);
    
            for (state of states) {
                States.create({ 
                    prefix: state.prefix, 
                    initials: state.initials, 
                    name: state.name 
                });
            }
        });
    }
};

const initDbCounties = async () => {
    let savedCounties = await Counties.findAll();
    
    if (savedCounties.length == 0) {
        await fs.readFile(`${__dirname}/municipios-2019.csv`, async (err, data) => {
            if (err) {
                console.error(err);
                return
            }
    
            let counties = await neatCsv(data);
    
            for (county of counties) {
                Counties.create({ 
                    code: county.codigo_ibge, 
                    name: county.nome 
                });
            }
        });
    }
}

exports.initDbStates = initDbStates;
exports.initDbCounties = initDbCounties;