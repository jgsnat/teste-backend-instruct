const States = require('../models/states.model');

class StatesService {
    async getState(id) {
        return await States.findByPk(id);
    }
}

module.exports = new StatesService();