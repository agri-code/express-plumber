// const middlewares = require('express-plumber').loadMiddlewares();

module.exports = {
  middlewares: [
    // List of middlewares here
  ],

  // Enable to para
  parametrizePath: false,
  // eslint-disable-next-line no-unused-vars
  callback: async function root(request, response, next) {
    try {
      return response.json({ code: 200, message: 'OK' });
    } catch (exception) {
      return response.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
