const express = require('express');
const plumber = require('../index');

const app = express();
app.use(express.json());

plumber.loadAndApplyRoutes(app, './routes');
app.listen(42024, '0.0.0.0', () => {});
module.exports = app;
