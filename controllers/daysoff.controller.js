const { INTERNEL_SERVER_ERROR, OK, UNPROCESSABLE_ENTITY, NOT_FOUND } = require("../utils/constant");
const DaysOffService = require('../services/daysoff.service');
const { objectIsEmpty } = require("../utils");

class DaysOffController {

    async getDayOff(req, res) {
        try {
            const { code, date } = req.params;
            const error = await DaysOffService.isValidParams(code, date);
            
            if (error) {
                console.error(error);
                return res.status(UNPROCESSABLE_ENTITY).send({ 
                    error
                });
            }

            const name = await DaysOffService.getDayOff(code, date);
            if (name === null) {
                return res.sendStatus(NOT_FOUND);
            } 

            return res.status(OK).send({ name }); 
        } catch (errors) {
            console.error(errors);
            return res.status(INTERNEL_SERVER_ERROR).send({ errors });
        }
    }

    async updateDayOff(req, res) {
        try {
            const { code, date } = req.params;
            const { name } = req.body;
            const dateWithYear = `${new Date().getFullYear()}-${date}`;

            if (date.trim() === 'carnaval' || date.trim() === 'corpus-christi') {
                const error = await DaysOffService.isValidParamsUpdateOrCreateMoved(code);
                if (error) {
                    console.error(error);
                    return res.status(UNPROCESSABLE_ENTITY).send({ 
                        error
                    });
                }
    
                const result = await DaysOffService.updateOrCreateDaysOffMoved(code, date);
                if (result === null) {
                    return res.sendStatus(NOT_FOUND);
                } 
    
                return res.status(result.code).send({ name: result.name });
            } else {
                const error = await DaysOffService.isValidParamsUpdateOrCreate(code, dateWithYear, name);
                if (error) {
                    console.error(error);
                    return res.status(UNPROCESSABLE_ENTITY).send({ 
                        error
                    });
                }
    
                const result = await DaysOffService.updateOrCreateDaysOff(code, dateWithYear, name);
                if (result === null) {
                    return res.sendStatus(NOT_FOUND);
                } 
    
                return res.status(result).send({ name });    
            }             
        } catch (errors) {
            console.error(errors);
            return res.status(INTERNEL_SERVER_ERROR).send({ errors });
        }
    }

    async removeDayOff(req, res) {
        try {
            const { code, date } = req.params;
            const dateWithYear = `${new Date().getFullYear()}-${date}`;

            if (date.trim() === 'carnaval' || date.trim() === 'corpus-christi') {
                const error = await DaysOffService.isValidParamsRemovedMoved(code, date);
                if (error !== null) {
                    console.error(error.error);
                    return res.status(error.code).send({ 
                        error: error.error
                    });
                }
    
                const result = await DaysOffService.removeDaysOffMoved(code, date);
                if (result === null) {
                    return res.sendStatus(NOT_FOUND);
                } 
    
                return res.sendStatus(result.code);
            } else {
                const error = await DaysOffService.isValidParamsRemoved(code, dateWithYear);
                if (error !== null) {
                    console.error(error);
                    return res.status(error.code).send({ 
                        error: error.error
                    });
                }
    
                const result = await DaysOffService.removeDaysOff(code, dateWithYear);
                if (result === null) {
                    return res.sendStatus(NOT_FOUND);
                } 
    
                return res.sendStatus(result.code);    
            }             
        } catch (errors) {
            console.error(errors);
            return res.status(INTERNEL_SERVER_ERROR).send({ errors });
        }
    }
}

module.exports = new DaysOffController();