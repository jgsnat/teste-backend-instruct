const express = require('express');
const router = express.Router();
const DaysOffController = require('../controllers/daysoff.controller');
const URI_BASE = '/feriados/'

router.get(`${URI_BASE}:code/:date`, DaysOffController.getDayOff);
router.put(`${URI_BASE}:code/:date`);
router.delete(`${URI_BASE}:code/:date`);

module.exports = router;