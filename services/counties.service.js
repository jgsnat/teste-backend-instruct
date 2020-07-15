const Counties = require('../models/counties.model');

class CountiesService {
    async getCounty(id) {
        return await Counties.findByPk(id);
    }
}

module.exports = new CountiesService();