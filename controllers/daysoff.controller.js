const { INTERNEL_SERVER_ERROR, OK, UNPROCESSABLE_ENTITY, NOT_FOUND } = require("../utils/constant");
const DaysOffService = require('../services/daysoff.service');

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
            const isDayMovel = DaysOffService.isDayOffMovel(date);
            let error;
            let result;

            if (isDayMovel) {
                error = await DaysOffService.isValidParamsUpdateOrCreateMoved(code)
            } else {
                error = await DaysOffService.isValidParamsUpdateOrCreate(code, dateWithYear, name);
            }

            if (error) {
                console.error(error);
                return res.status(UNPROCESSABLE_ENTITY).send({ 
                    error
                });
            }

            if (isDayMovel) {
                result = await DaysOffService.updateOrCreateDaysOffMoved(code, date);
            } else {
                result = await DaysOffService.updateOrCreateDaysOff(code, dateWithYear, name);
            }

            if (result === null) {
                return res.sendStatus(NOT_FOUND);
            }

            if (isDayMovel) {
                return res.status(result.code).send({ name: result.name });
            } else {
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
            const isDayMovel = DaysOffService.isDayOffMovel(date);
            let error;
            let result;

            if (isDayMovel) {
                error = await DaysOffService.isValidParamsRemovedMoved(code, date);   
            } else {
                error = await DaysOffService.isValidParamsRemoved(code, dateWithYear);
            }

            if (error !== null) {
                console.error(error.error);
                return res.status(error.code).send({ 
                    error: error.error
                });
            }

            if (isDayMovel) {
                result = await DaysOffService.removeDaysOffMoved(code, date);   
            } else {
                result = await DaysOffService.removeDaysOff(code, dateWithYear);
            }
            
            if (result === null) {
                return res.sendStatus(NOT_FOUND);
            } 
    
            return res.sendStatus(result.code);
        } catch (errors) {
            console.error(errors);
            return res.status(INTERNEL_SERVER_ERROR).send({ errors });
        }
    }
}

module.exports = new DaysOffController();