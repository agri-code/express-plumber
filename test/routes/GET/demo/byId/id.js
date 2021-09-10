// const middlewares = require('express-plumber').loadMiddlewares();

module.exports = {
  middlewares: [
    // List of middlewares here
  ],

  // Enable to para
  parametrizePath: true,

  // eslint-disable-next-line no-unused-vars
  callback: async function root(request, response, next) {
    try {
      // eslint-disable-next-line radix
      request.params.id = parseInt(request.params.id);
      return response.json({ ...request.params, code: 200 });
    } catch (exception) {
      return response.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
