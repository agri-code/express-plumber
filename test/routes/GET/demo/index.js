// const middlewares = require('express-plumber').loadMiddlewares();

module.exports = {
  middlewares: [
    // List of middlewares here
  ],
  // Enable to parametrize the entire path
  parametrizePath: true,

  // Set the priority to -1 to be the second last route
  // to be added to the stack
  priority: -1,

  // eslint-disable-next-line no-unused-vars
  callback: async function root(request, response, next) {
    try {
      return response.json({ code: 200, message: 'DEMO' });
    } catch (exception) {
      return response.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
