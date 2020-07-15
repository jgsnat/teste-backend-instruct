const { INTERNEL_SERVER_ERROR, OK, UNPROCESSABLE_ENTITY, NOT_FOUND } = require("../utils/constant");
const DaysOffService = require('../services/daysoff.service');

class DaysOffController {

    async getDayOff(req, res) {
        try {
            const { code, date } = req.params;
            let error = await DaysOffService.isValidParams(code, date);
            
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
}

module.exports = new DaysOffController();