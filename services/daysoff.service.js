const DaysOff = require('../models/daysoff.model');
const CountisService = require('../services/counties.service');
const StatesService = require('../services/states.service');
const { dateValidation, meeusAlgorithm } = require('../utils');

class DaysOffService {

    async getDayOff(code, date) {
        let dayOff = null;
        let partsOfDate = date.split('-');
        let year = partsOfDate[0].trim();
        let month = partsOfDate[1].trim();
        let day = partsOfDate[2].trim();

        let dayOffNational = await this.isDaysOffNational(day, month);
        if (dayOffNational) {
            dayOff = dayOffNational.name;    
        } 
        
        let dayMobileHoliday = this.mobileHolidays(year, month, day);
        if (dayMobileHoliday) {
            dayOff = dayMobileHoliday;
        }

        return dayOff;
    }

    isValidParams(code, date) {
        if (!this.isValidDate(date)) {
            return `A data informada: ${date}, deve seguir o seguinte padrão: YYYY-MM-DD`;
        }

        if (!this.isValidCode(code)) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        return null;
    }

    isValidCode(code) {
        try {
            console.log('entrou 2');
            if (code.length === 2) {
                return StatesService.getState(code);
            } else if (code.length === 7) {
                return CountisService.getCounty(code);
            } else {
                return false;
            }
        } catch(error) {
            throw `DaysOffService isValidCode function failed: ${error}`;
        }
    }

    async isValidDate(date) {
        console.log(await !dateValidation(date));
        return await dateValidation(date);
    }

    async isDaysOffNational(day, month) {
        let valor = await DaysOff.findOne({
            where: {
                day,
                month,
                national: true
            }
        });

        if (valor) {
            return valor.dataValues;
        } else {
            return null;
        }
    }

    async mobileHolidays(year, month, day) {
        let easter = await meeusAlgorithm(parseInt(year)).split('-');
        let nameDayOff = null;
        if (easter[1] < 10) {
            easter[1] = `0${easter[1]}`;
        }

        if (easter[2] < 10) {
            easter[2] = `0${easter[2]}`;
        }

        if (year === easter[0] 
            && month === easter[1] 
            && day === easter[2]) {
                nameDayOff = 'Páscoa';

                return nameDayOff;
        }

        return nameDayOff;
    }
}

module.exports = new DaysOffService();