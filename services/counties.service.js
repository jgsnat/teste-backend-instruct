const Counties = require('../models/counties.model');

class CountiesService {
    getCounty(id) {
        return Counties.findByPk(parseInt(id));
    }
}

module.exports = new CountiesService();