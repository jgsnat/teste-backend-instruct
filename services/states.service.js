const States = require('../models/states.model');

class StatesService {
    async getState(id) {
        return await States.findByPk(id);
    }
    
    getModel() {
        return States;
    }
}

module.exports = new StatesService();