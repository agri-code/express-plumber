// const middlewares = require('express-plumber').loadMiddlewares();

module.exports = {
  middlewares: [
    // List of middlewares here
  ],
  // Enable to para
  parametrizePath: true,

  // Override the path to literally catch anything
  path: '*',

  // Setting the priority to -1 in order to be the last
  // route to be added to the stack
  priority: -2,

  // eslint-disable-next-line no-unused-vars
  callback: async function root(request, response, next) {
    try {
      return response.json({ code: 200, id: 'catchAll' });
    } catch (exception) {
      return response.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
