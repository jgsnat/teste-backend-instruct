const Counties = require("../models/counties.model");

class CountiesRepository {
    async findById(id) {
        return await Counties.findByPk(id);
    }

    getModelClass() {
        return Counties;
    }
}

module.exports = new CountiesRepository();