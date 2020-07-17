const DaysOff = require('../models/daysoff.model');
const CountisService = require('../services/counties.service');
const StatesService = require('../services/states.service');
const { dateValidation, meeusAlgorithm } = require('../utils');
const moment = require('moment');
const { CREATED, OK, UNPROCESSABLE_ENTITY, FORBIDDEN, NOT_CONTENT, NOT_FOUND } = require('../utils/constant');

const TYPE_STATE = 'STATE';
const TYPE_COUNTY = 'COUNTY';

class DaysOffService {

    async getDayOff(code, date) {
        const { day, month, year } = this.getDayMonthAndYear(date);

        const dayOffNational = await this.isDaysOffNational(day, month);
        if (dayOffNational) {
            return dayOffNational.name;    
        }

        const dayOffCounty = await this.isDaysOffCounty(day, month, parseInt(code));
        if (dayOffCounty) {
            return dayOffCounty.name;
        }

        if (code.length === 7) {
            code = code.toString().substring(0, 2);
        }
        const dayOffState = await this.isDaysOffState(day, month, parseInt(code));
        if (dayOffState) {
            return dayOffState.name;
        }

        const dayMobileHoliday = await this.mobileHolidays(year, month, day);
        if (dayMobileHoliday) {
            return dayMobileHoliday;
        }

        return null;
    }

    async updateOrCreateDaysOff(code, date, name) {
        const { day, month } = this.getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month, code);
        const type = await this.getTypeCode(code);

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
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);
            const type = await this.getTypeCode(code);

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
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);
            const type = await this.getTypeCode(code);

            if (!existsDayOff) {
                await this.createDayOff({ day, month, code, name, type });
    
                return { code: CREATED, name };
            } else {
                await this.updateDayOff({ day, month, code, name, type });
    
                return { code: OK, name };
            }
        }

    }

    async removeDaysOffMoved(code, date) {
        const year = new Date().getFullYear();
        const dayEaster = await this.getDayEaster(year);

        if (date.trim() === 'carnaval') {
            const dayCarnival = await this.getCarnival(dayEaster).split('-');
            const day = dayCarnival[2];
            const month = dayCarnival[1];
            const name = 'Carnaval';
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);
            const type = await this.getTypeCode(code);

            if (!existsDayOff) {
                return null;
            } else {
                await this.removeDayOff({ day, month, code, type });
    
                return { code: NOT_CONTENT, name };
            }
        }

        if (date.trim() === 'corpus-christi') {
            const dayCorpusChristi = await this.getCorpusChristi(dayEaster).split('-');
            const day = dayCorpusChristi[2];
            const month = dayCorpusChristi[1];
            const name = 'Corpus Christi';
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);
            const type = await this.getTypeCode(code);

            if (!existsDayOff) {
                return null;
            } else {
                await this.removeDayOff({ day, month, code, type });
    
                return { code: NOT_CONTENT, name };
            }
        }

    }

    async removeDaysOff(code, date) {
        const { day, month } = this.getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month, code);
        const type = await this.getTypeCode(code);

        if (!existsDayOff) {
            return null;
        } else {
            await this.removeDayOff({ day, month, code, type });

            return { code: NOT_CONTENT };
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

    async removeDayOff(values) {
        const { day, month, code, type } = values;

        if (type === TYPE_STATE) {
            await DaysOff.destroy({
                where: { day, month },
                include: [{
                    model: StatesService.getModel(),
                    as: 'states',
                    where: { prefix: parseInt(code) }
                }]
            });
        } else {
            await DaysOff.destroy({
                where: { day, month },
                include: [{
                    model: CountisService.getModel(),
                    as: 'counties',
                    where: { code: parseInt(code) }
                }]
            });
        }
    }

    async isValidParams(code, date) {
        if (!dateValidation(date)) {
            return `A data informada: ${date}, deve seguir o seguinte padrão: YYYY-MM-DD`;
        }

        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        return null;
    }

    async isValidParamsUpdateOrCreate(code, date, name) {
        if (!dateValidation(date)) {
            let time = date.split('-');
            return `A data informada: ${time[1]}-${time[2]}, deve seguir o seguinte padrão: MM-DD`;
        }

        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        if (!name || name === '' || name === undefined) {
            return `O nome do feriado informado não é válido: ${name}`;
        }

        return null;        
    }

    async isValidParamsUpdateOrCreateMoved(code) {
        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        return null;        
    }

    async isValidParamsRemovedMoved(code, date) {
        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return { 
                error: `O código do estado ou município informado não existe: ${code}`,
                code: UNPROCESSABLE_ENTITY
            };
        }

        if (date.trim() === 'carnaval') {
            const dayEaster = await this.getDayEaster(new Date().getFullYear());
            const dayCarnival = await this.getCarnival(dayEaster).split('-');
            const day = dayCarnival[2];
            const month = dayCarnival[1];
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);

            if (existsDayOff) {
                let dayOffState;
                if (code.length === 7) {
                    let codeForState = code.toString().substring(0, 2);
                    dayOffState = await this.isDaysOffState(day, month, parseInt(codeForState));
                } else {
                    dayOffState = await this.isDaysOffState(day, month, parseInt(code));
                }

                if (dayOffState && code.length === 7) {
                    return {
                        error: `Não é possível remover um feriado estadual de um município`,
                        code: FORBIDDEN
                    };
                }
            }

        }

        if (date.trim() === 'corpus-christi') {
            const dayEaster = await this.getDayEaster(new Date().getFullYear());
            const dayCorpusChristi = await this.getCorpusChristi(dayEaster).split('-');
            const day = dayCorpusChristi[2];
            const month = dayCorpusChristi[1];
            const existsDayOff = await this.getIfExistsDayOff(day, month, code);

            if (existsDayOff) {
                let dayOffState;
                if (code.length === 7) {
                    let codeForState = code.toString().substring(0, 2);
                    dayOffState = await this.isDaysOffState(day, month, parseInt(codeForState));
                } else {
                    dayOffState = await this.isDaysOffState(day, month, parseInt(code));
                }

                if (dayOffState && code.length === 7) {
                    return {
                        error: `Não é possível remover um feriado estadual de um município`,
                        code: FORBIDDEN
                    };
                }
            }

        }

        return null;
    }

    async isValidParamsRemoved(code, date) {
        if (!dateValidation(date)) {
            let time = date.split('-');
            return {
                error: `A data informada: ${time[1]}-${time[2]}, deve seguir o seguinte padrão: MM-DD`,
                code: UNPROCESSABLE_ENTITY
            };
        }

        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return { 
                error: `O código do estado ou município informado não existe: ${code}`,
                code: UNPROCESSABLE_ENTITY
            };;
        }

        const { day, month } = this.getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month, code);

        if (existsDayOff) {
            let dayOffState;
            if (code.length === 7) {
                let codeForState = code.toString().substring(0, 2);
                dayOffState = await this.isDaysOffState(day, month, parseInt(codeForState));
            } else {
                dayOffState = await this.isDaysOffState(day, month, parseInt(code));
            }

            if (dayOffState && code.length === 7) {
                return {
                    error: `Não é possível remover um feriado estadual de um município`,
                    code: FORBIDDEN
                };
            }
        }

        const dayOffNational = await this.isDaysOffNational(day, month);
        if (dayOffNational) {
            return {
                error: `Não é possível remover um feriado nacional de um município ou unidade federativa`,
                code: FORBIDDEN
            };
        }

        return null;        
    }

    async isValidParamsUpdateOrCreateMoved(code) {
        const validaCode = await this.isValidCode(code);
        if (!validaCode) {
            return `O código do estado ou município informado não existe: ${code}`;
        }

        return null;        
    }

    async isValidCode(code) {
        try {
            if (code.length === 2) {
                const state = await StatesService.getState(parseInt(code));

                return state instanceof StatesService.getModel();
            } else if (code.length === 7) {
                const county = await CountisService.getCounty(parseInt(code));

                return county instanceof CountisService.getModel();
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
        return moment(meeusAlgorithm(parseInt(year)), 'YYYY-MM-DD');
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
        const easterDay = `${easter[0]}-${easter[1]}-${easter[2]}`;
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
                return 'Corpus Christi';
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
        } 
        
        const codeCounty = await CountisService.getCounty(parseInt(code));
        if (codeCounty) {
            return TYPE_COUNTY;
        }

        return null;
    }

    async getIfExistsDayOff(day, month, code) {
        const result = await DaysOff.findOne({
            where: { day, month }
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }
}

module.exports = new DaysOffService();