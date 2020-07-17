const States = require("../models/states.model");

class StatesRepository {
    async findById(id) {
        return await States.findByPk(id);
    }
    
    getModelClass() {
        return States;
    }
}

module.exports = new StatesRepository();