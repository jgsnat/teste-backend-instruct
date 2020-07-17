const StatesRepository = require("../repository/states.repository");

class StatesService {
    async getState(id) {
        return await StatesRepository.findById(id);
    }
    
    getModel() {
        return StatesRepository.getModelClass();
    }
}

module.exports = new StatesService();