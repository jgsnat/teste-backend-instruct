const DaysOff = require('../models/daysoff.model');
const CountisService = require('../services/counties.service');
const StatesService = require('../services/states.service');
const { dateValidation, meeusAlgorithm } = require('../utils');
const moment = require('moment');
const States = require('../models/states.model');
const Counties = require('../models/counties.model');

class DaysOffService {

    async getDayOff(code, date) {
        let partsOfDate = date.split('-');
        let year = partsOfDate[0].trim();
        let month = partsOfDate[1].trim();
        let day = partsOfDate[2].trim();

        let dayOffNational = await this.isDaysOffNational(day, month);
        if (dayOffNational) {
            return dayOffNational.name;    
        } 

        let dayMobileHoliday = await this.mobileHolidays(year, month, day);
        if (dayMobileHoliday) {
            return dayMobileHoliday;
        }

        let dayOffState = await this.isDaysOffState(day, month, parseInt(code));
        if (dayOffState) {
            return dayOffState.name;
        }

        let dayOffCounty = await this.isDaysOffCounty(day, month, parseInt(code));
        if (dayOffCounty) {
            return dayOffCounty.name;
        }

        return null;
    }

    async isValidParams(code, date) {
        if (!dateValidation(date)) {
            return `A data informada: ${date}, deve seguir o seguinte padrão: YYYY-MM-DD`;
        }

        if (!this.isValidCode(code)) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        return null;
    }

    isValidCode(code) {
        try {
            if (code.length === 2) {
                return StatesService.getState(parseInt(code));
            } else if (code.length === 7) {
                return CountisService.getCounty(parseInt(code));
            } else {
                return false;
            }
        } catch(error) {
            throw `DaysOffService isValidCode function failed: ${error}`;
        }
    }

    async isDaysOffNational(day, month) {
        let result = await DaysOff.findOne({
            where: {
                day,
                month,
                national: true
            }
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }

    async isDaysOffState(day, month, code) {
        let result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: States,
                as: 'states',
                where: { prefix: code }
            }]
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }
    
    async isDaysOffCounty(day, month, code) {
        let result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: Counties,
                as: 'counties',
                where: { code }
            }]
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }

    mobileHolidays(year, month, day) {
        let easter = meeusAlgorithm(parseInt(year)).split('-');
        if (easter[1] < 10) {
            easter[1] = `0${easter[1]}`;
        }

        if (easter[2] < 10) {
            easter[2] = `0${easter[2]}`;
        }

        if (year === easter[0] 
            && month === easter[1] 
            && day === easter[2]) {
                return 'Páscoa';
        }
        let easterDay = `${year}-${easter[1]}-${easter[2]}`;
        let goodFriday = moment(easterDay).subtract(2, 'days').format('YYYY-MM-DD').split('-');
        if (year === goodFriday[0] 
            && month === goodFriday[1] 
            && day === goodFriday[2]) {
                return 'Sexta-feira Santa'
            }

        let carnival = moment(easterDay).subtract(47, 'days').format('YYYY-MM-DD').split('-');
        if (year === carnival[0] 
            && month === carnival[1] 
            && day === carnival[2]) {
                return 'Carnaval';
        }

        let corpusChristi = moment(easterDay).add(60, 'days').format('YYYY-MM-DD').split('-');
        if (year === corpusChristi[0] 
            && month === corpusChristi[1] 
            && day === corpusChristi[2]) {
                return 'Corpus Christi ';
        }

        return null;
    }
}

module.exports = new DaysOffService();