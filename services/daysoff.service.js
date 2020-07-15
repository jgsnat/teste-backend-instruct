const DaysOff = require('../models/daysoff.model');
const CountisService = require('../services/counties.service');
const StatesService = require('../services/states.service');
const { dateValidation, meeusAlgorithm } = require('../utils');
const moment = require('moment');
const { CREATED, OK } = require('../utils/constant');

const TYPE_STATE = 'STATE';
const TYPE_COUNTY = 'COUNTY';

class DaysOffService {

    async getDayOff(code, date) {
        const { day, month, year } = this.getDayMonthAndYear(date);

        const dayOffCounty = await this.isDaysOffCounty(day, month, parseInt(code));
        if (dayOffCounty) {
            return dayOffCounty.name;
        }

        const dayOffState = await this.isDaysOffState(day, month, parseInt(code));
        if (dayOffState) {
            return dayOffState.name;
        }

        const dayOffNational = await this.isDaysOffNational(day, month);
        if (dayOffNational) {
            return dayOffNational.name;    
        } 

        const dayMobileHoliday = await this.mobileHolidays(year, month, day);
        if (dayMobileHoliday) {
            return dayMobileHoliday;
        }

        return null;
    }

    async updateOrCreateDaysOff(code, date, name) {
        const { day, month } = this.getDayMonthAndYear(date);
        const { type, existsDayOff } = await this.getTypeCodeAndIfExists(day, month, code);

        if (!existsDayOff) {
            await this.createDayOff({ day, month, code, name, type });

            return CREATED;
        } else {
            await this.updateDayOff({ day, month, code, name, type });

            return OK;
        }
    }

    async updateOrCreateDaysOffMoved(code, date) {
        const year = new Date().getFullYear();
        const dayEaster = await this.getDayEaster(year);

        if (date.trim() === 'carnaval') {
            const dayCarnival = await this.getCarnival(dayEaster).split('-');
            const day = dayCarnival[2];
            const month = dayCarnival[1];
            const name = 'Carnaval';
            const { type, existsDayOff } = await this.getTypeCodeAndIfExists(day, month, code);

            if (!existsDayOff) {
                await this.createDayOff({ day, month, code, name, type });
    
                return { code: CREATED, name };
            } else {
                await this.updateDayOff({ day, month, code, name, type });
    
                return { code: OK, name };
            }
        }

        if (date.trim() === 'corpus-christi') {
            const dayCorpusChristi = await this.getCorpusChristi(dayEaster).split('-');
            const day = dayCorpusChristi[2];
            const month = dayCorpusChristi[1];
            const name = 'Corpus Christi';
            const { type, existsDayOff } = await this.getTypeCodeAndIfExists(day, month, code);

            if (!existsDayOff) {
                await this.createDayOff({ day, month, code, name, type });
    
                return { code: CREATED, name };
            } else {
                await this.updateDayOff({ day, month, code, name, type });
    
                return { code: OK, name };
            }
        }

    }

    async createDayOff(values) {
        const { day, month, code, name, type } = values;

        if (type === TYPE_STATE) {
            await DaysOff.create({
                day,
                month,
                name: name.trim(),
                states_prefix: parseInt(code)
            });
        } else {
            await DaysOff.create({
                day,
                month,
                name: name.trim(),
                counties_code: parseInt(code)
            });
        }
    }

    async updateDayOff(values) {
        const { day, month, code, name, type } = values;

        if (type === TYPE_STATE) {
            await DaysOff.update({ name: name.trim() }, 
                {
                    where: { day, month },
                    include: [{
                        model: StatesService.getModel(),
                        as: 'states',
                        where: { prefix: parseInt(code) }
                    }]
                }
            );
        } else {
            await DaysOff.update({ name: name.trim() }, 
                {
                    where: { day, month },
                    include: [{
                        model: CountisService.getModel(),
                        as: 'counties',
                        where: { code: parseInt(code) }
                    }]
                }
            );
        }
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

    async isValidParamsUpdateOrCreate(code, date, name) {
        if (!dateValidation(date)) {
            let time = date.split('-');
            return `A data informada: ${time[1]}-${time[2]}, deve seguir o seguinte padrão: MM-DD`;
        }

        if (!this.isValidCode(code)) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        if (!name || name === '' || name === undefined) {
            return `O nome do feriado informado não é válido: ${name}`;
        }

        return null;        
    }

    async isValidParamsUpdateOrCreateMoved(code) {
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
        const result = await DaysOff.findOne({
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
        const result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: StatesService.getModel(),
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
        const result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: CountisService.getModel(),
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

    getDayEaster(year) {
        return moment(meeusAlgorithm(parseInt(year)));
    }

    getGoodFriday(date) {
        return moment(date,'YYYY-MM-DD').subtract(2, 'days').format('YYYY-MM-DD');
    }

    getCarnival(date) {
        return moment(date,'YYYY-MM-DD').subtract(47, 'days').format('YYYY-MM-DD');
    }

    getCorpusChristi(date) {
        return moment(date,'YYYY-MM-DD').add(60, 'days').format('YYYY-MM-DD');
    }

    async mobileHolidays(year, month, day) {
        const easter = await this.getDayEaster(parseInt(year)).format('YYYY-MM-DD').split('-');

        if (year === easter[0] 
            && month === easter[1] 
            && day === easter[2]) {
                return 'Páscoa';
        }
        const easterDay = `${year}-${easter[1]}-${easter[2]}`;
        const goodFriday = await this.getGoodFriday(easterDay).split('-');
        if (year === goodFriday[0] 
            && month === goodFriday[1] 
            && day === goodFriday[2]) {
                return 'Sexta-feira Santa'
            }

        const carnival = await this.getCarnival(easterDay).split('-');
        if (year === carnival[0] 
            && month === carnival[1] 
            && day === carnival[2]) {
                return 'Carnaval';
        }

        const corpusChristi = await this.getCorpusChristi(easterDay).split('-');
        if (year === corpusChristi[0] 
            && month === corpusChristi[1] 
            && day === corpusChristi[2]) {
                return 'Corpus Christi ';
        }

        return null;
    }

    getDayMonthAndYear(date) {
        const partsOfDate = date.split('-');
        const year = partsOfDate[0].trim();
        const month = partsOfDate[1].trim();
        const day = partsOfDate[2].trim();

        return { day, month, year };
    }

    async getTypeCode(code) {
        const codeState = await StatesService.getState(parseInt(code));

        if (codeState) {
            return TYPE_STATE;
        } else {
            return TYPE_COUNTY;
        }
    }

    async getTypeCodeAndIfExists(day, month, code) {
        const type = await this.getTypeCode(code);
        let existsDayOff = null;

        if (type === TYPE_STATE) {
            existsDayOff = await this.isDaysOffState(day, month, code);
        } else {
            existsDayOff = await this.isDaysOffCounty(day, month, code);
        }

        return { type, existsDayOff };
    }
}

module.exports = new DaysOffService();