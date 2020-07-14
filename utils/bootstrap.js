const States = require('../models/states.model');
const Counties = require('../models/counties.model');
const DaysOff = require('../models/daysoff.model');
const { readFile } = require('.');

const initDbStates = async () => {
    let savedStates = await States.findAll();

    if (savedStates.length === 0) {
        let states = await readFile('estados-2019.csv');
    
        for (state of states) {
            States.create({ 
                prefix: state.prefix, 
                initials: state.initials, 
                name: state.name.trim() 
            });
        }
    }
};

const initDbCounties = async () => {
    let savedCounties = await Counties.findAll();
    
    if (savedCounties.length == 0) {
        let counties = await readFile('municipios-2019.csv');
    
        for (county of counties) {
            Counties.create({ 
                code: county.codigo_ibge, 
                name: county.nome.trim() 
            });
        }
    }
};

const initDbDaysOff = async () => {
    let savedDaysOff = await DaysOff.findAll();

    if (savedDaysOff.length === 0) {
        let daysOff = await readFile('feriados-nacionais.csv');
    
        for (dayOff of daysOff) {
            let date = dayOff.data.split('/'); 
            let day = date[0].trim();
            let month = date[1].trim();
            
            DaysOff.create({
                day,
                month,
                name: dayOff.nome.trim(),
                national: true
            });
        }
    }
};

exports.initDbStates = initDbStates;
exports.initDbCounties = initDbCounties;
exports.initDbDaysOff = initDbDaysOff;