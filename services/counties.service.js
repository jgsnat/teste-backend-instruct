const CountiesRepository = require("../repository/counties.repository");

class CountiesService {
    async getCounty(id) {
        return await CountiesRepository.findById(id);
    }

    getModel() {
        return CountiesRepository.getModelClass();
    }
}

module.exports = new CountiesService();