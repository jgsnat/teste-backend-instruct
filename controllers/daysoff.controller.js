const { INTERNEL_SERVER_ERROR, OK, UNPROCESSABLE_ENTITY, NOT_FOUND } = require("../utils/constant");
const DaysOffService = require('../services/daysoff.service');

class DaysOffController {

    async getDayOff(req, res) {
        try {
            const { code, date } = req.params;
            /*let error = DaysOffService.isValidParams(code, date);
            if (error) {
                return res.status(UNPROCESSABLE_ENTITY).send({ 
                    error
                });
            }*/
            if (!DaysOffService.isValidDate(date)) {
                console.log('Entrou');
                return res.status(UNPROCESSABLE_ENTITY).send({ 
                    error: `A data informada: ${date}, deve seguir o seguinte padrão: YYYY-MM-DD`
                });
            }

            if (!DaysOffService.isValidCode(code)) {
                return res.status(UNPROCESSABLE_ENTITY).send({ 
                    error: `O código do estado ou município informado não existe: ${code}`
                });
            }

            const name = await DaysOffService.getDayOff(code, date);
            if (!name) {
                return res.status(NOT_FOUND);
            } 

            return res.status(OK).send({ name }); 
        } catch (errors) {
            console.error(errors);
            return res.status(INTERNEL_SERVER_ERROR).send({ errors });
        }
    }
}

module.exports = new DaysOffController();