const express = require('express');
const router = require('../routes');
const allowCors = require('./cors');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(allowCors);
app.use(router);

module.exports = app;