const DaysOff = require("../models/daysoff.model");
const StatesService = require("../services/states.service");
const CountisService = require("../services/counties.service");

class DaysOffRepository {
    async findById(id) {
        return await DaysOff.findByPk(id);
    }

    async findDayOffNational(values) {
        const { day, month } = values;
        const result = await DaysOff.findOne({
            where: {
                day,
                month,
                national: true
            }
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }

    async findDayOffState(values) {
        const { day, month, code } = values;
        const result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: StatesService.getModel(),
                as: 'states',
                where: { prefix: code }
            }]
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }

    async findDayOffCounty(values) {
        const { day, month, code } = values;
        const result = await DaysOff.findOne({
            where: { day, month },
            include: [{
                model: CountisService.getModel(),
                as: 'counties',
                where: { code }
            }]
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }

    async findDayOff(values) {
        const { day, month } = values;
        const result = await DaysOff.findOne({
            where: { day, month }
        });

        if (result) {
            return result.dataValues;
        } else {
            return null;
        }
    }
    
    getModelClass() {
        return DaysOff;
    }

    async createDayOffState(values) {
        const { day, month, code, name } = values;

        await DaysOff.create({
            day,
            month,
            name: name.trim(),
            states_prefix: parseInt(code)
        });
    }

    async updateDayOffState(values) {
        const { day, month, code, name } = values;

        await DaysOff.update({ name: name.trim() }, 
            {
                where: { day, month },
                include: [{
                    model: StatesService.getModel(),
                    as: 'states',
                    where: { prefix: parseInt(code) }
                }]
            }
        );
    }

    async removeDayOffState(values) {
        const { day, month, code } = values;

        await DaysOff.destroy({
            where: { day, month },
            include: [{
                model: StatesService.getModel(),
                as: 'states',
                where: { prefix: parseInt(code) }
            }]
        });
    }

    async createDayOffCounty(values) {
        const { day, month, code, name } = values;

        await DaysOff.create({
            day,
            month,
            name: name.trim(),
            counties_code: parseInt(code)
        });
    }

    async updateDayOffCounty(values) {
        const { day, month, code, name } = values;

        await DaysOff.update({ name: name.trim() }, 
            {
                where: { day, month },
                include: [{
                    model: CountisService.getModel(),
                    as: 'counties',
                    where: { code: parseInt(code) }
                }]
            }
        );
    }

    async removeDayOffCounty(values) {
        const { day, month, code } = values;

        DaysOff.destroy({
            where: { day, month },
            include: [{
                model: CountisService.getModel(),
                as: 'counties',
                where: { code: parseInt(code) }
            }]
        });
    }
}

module.exports = new DaysOffRepository();