const Counties = require('../models/counties.model');

class CountiesService {
    async getCounty(id) {
        return await Counties.findByPk(id);
    }

    getModel() {
        return Counties;
    }
}

module.exports = new CountiesService();