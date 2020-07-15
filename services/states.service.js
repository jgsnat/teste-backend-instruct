const States = require('../models/states.model');

class StatesService {
    getState(id) {
        return States.findByPk(parseInt(id));
    }
}

module.exports = new StatesService();