const DaysOffRepository = require('../repository/daysoff.repository');
const CountisService = require('../services/counties.service');
const StatesService = require('../services/states.service');
const { 
    dateValidation, 
    meeusAlgorithm, 
    getDayMonthAndYear, 
    comparateDates
} = require('../utils');
const moment = require('moment');
const { 
    CREATED, 
    OK, 
    UNPROCESSABLE_ENTITY, 
    FORBIDDEN, 
    NOT_CONTENT 
} = require('../utils/constant');
const TYPE_STATE = 'STATE';
const TYPE_COUNTY = 'COUNTY';
const TYPE_CARNAVAL = 'carnaval';
const TYPE_CORPUS_CHRISTI = 'corpus-christi';

class DaysOffService {

    async getDayOff(code, date) {
        const { day, month, year } = getDayMonthAndYear(date);

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
        const { day, month } = getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month);
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
        let dayOff;
        let name;

        if (date.trim() === 'carnaval') {
            dayOff = await this.getCarnival(dayEaster).split('-');
            name = 'Carnaval';
        } else {
            dayOff = await this.getCorpusChristi(dayEaster).split('-');
            name = 'Corpus Christi';   
        }

        const day = dayOff[2];
        const month = dayOff[1];
        const existsDayOff = await this.getIfExistsDayOff(day, month);
        const type = await this.getTypeCode(code);

        if (!existsDayOff) {
            await this.createDayOff({ day, month, code, name, type });

            return { code: CREATED, name };
        } else {
            await this.updateDayOff({ day, month, code, name, type });

            return { code: OK, name };
        }
    }

    async removeDaysOffMoved(code, date) {
        const year = new Date().getFullYear();
        const dayEaster = await this.getDayEaster(year);
        let dayOff;
        let name;

        if (date.trim() === 'carnaval') {
            dayOff = await this.getCarnival(dayEaster).split('-');
            name = 'Carnaval';
        } else {
            dayOff = await this.getCorpusChristi(dayEaster).split('-');
            name = 'Corpus Christi';
        }

        const day = dayOff[2];
        const month = dayOff[1];
        const existsDayOff = await this.getIfExistsDayOff(day, month);
        const type = await this.getTypeCode(code);

        if (!existsDayOff) {
            return null;
        } else {
            await this.removeDayOff({ day, month, code, type });

            return { code: NOT_CONTENT, name };
        }
    }

    async removeDaysOff(code, date) {
        const { day, month } = getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month);
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
            await DaysOffRepository.createDayOffState({ day, month, code, name });
        } else {
            await DaysOffRepository.createDayOffCounty({ day, month, code, name });
        }
    }

    async updateDayOff(values) {
        const { day, month, code, name, type } = values;

        if (type === TYPE_STATE) {
            await DaysOffRepository.updateDayOffState({ day, month, code, name });
        } else {
            await DaysOffRepository.updateDayOffCounty({ day, month, code, name });
        }
    }

    async removeDayOff(values) {
        const { day, month, code, type } = values;

        if (type === TYPE_STATE) {
            await DaysOffRepository.removeDayOffState({ day, month, code });
        } else {
            await DaysOffRepository.removeDayOffCounty({ day, month, code });
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

        if (this.isDayOffMovel(date)) {
            let dayOffMoved;
            const dayEaster = await this.getDayEaster(new Date().getFullYear());

            if (date.trim() === 'carnaval') {
                dayOffMoved = await this.getCarnival(dayEaster).split('-');    
            } else {
                dayOffMoved = await this.getCorpusChristi(dayEaster).split('-');
            }

            const day = dayOffMoved[2];
            const month = dayOffMoved[1];
            const existsDayOff = await this.getIfExistsDayOff(day, month);

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

        const { day, month } = getDayMonthAndYear(date);
        const existsDayOff = await this.getIfExistsDayOff(day, month);

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
        return await DaysOffRepository.findDayOffNational({ day, month });
    }

    async isDaysOffState(day, month, code) {
        return await DaysOffRepository.findDayOffState({ day, month, code });
    }
    
    async isDaysOffCounty(day, month, code) {
        return await DaysOffRepository.findDayOffCounty({ day, month, code });
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
        const easter = await this.getDayEaster(parseInt(year)).format('YYYY-MM-DD');
        const paramsDate = `${year}-${month}-${day}`;

        if (comparateDates(easter, paramsDate)) {
            return 'Páscoa';
        }

        const goodFriday = await this.getGoodFriday(easter);
        if (comparateDates(goodFriday, paramsDate)) {
            return 'Sexta-feira Santa';
        }

        const carnival = await this.getCarnival(easter);
        if (comparateDates(carnival, paramsDate)) {
            return 'Carnaval';
        }

        const corpusChristi = await this.getCorpusChristi(easter);
        if (comparateDates(corpusChristi, paramsDate)) {
            return 'Corpus Christi';
        }

        return null;
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

    async getIfExistsDayOff(day, month) {
        return await DaysOffRepository.findDayOff({ day, month });
    }

    isDayOffMovel(date) {
        const test = date.trim().toLowerCase();

        return (test === TYPE_CARNAVAL || test === TYPE_CORPUS_CHRISTI);
    }
}

module.exports = new DaysOffService();