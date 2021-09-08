# `express-plumber`

Utility to 


- remove the burden of writing  boilerplate code
- speeding up development of express applications
- separating concerns by splitting route and middleware into separate files


by rigorously imposing a convention to adhere to. It provides various functions
 and utitlies to facilitate rapid protoyping and development.

---

## Planned features

- Auto-reloading of routes on file change

---

## Quickstart

- Create the directories `routes/GET`
- create the `index.js` file inside of it
- paste the following skeleton into it:

> ```javascript
> const middlewares = require('express-plumber').loadMiddlewares()
> 
> module.exports = {
>     middlewares: [
>         // List of middlewares here
>     ],
> 
>     // Ignore it for now, we'll get to it in a bit
>     parametrizePath: false,
> 
>     // This is the callback that will be exectued by express
>     // when / is being requested
>     callback: async (request, response, next) => {
> 
>         try {
>             response.json({message: `Hello from ${
>                     request.originalUrl
>                 }`})
>         } catch (exception) { // Todo: Implement error handling
>             console.log(exception)
>         }
> 
>     }
> }
> ```

Open or create your `index.js` in the project root directory and add the following code

> ```javascript
> const express = require('express')
> const plumber = require('express-plumber')
> 
> const app = express()
>
> // Use json parser to service requests with content-type application/json
> app.use(express.json())
>
> // Invoke the loading and applying of routes to your app 
> plumber.loadAndApplyRoutes(app)
> 
> app.listen(42000, () => {
>   console.log(`Server started`)
> })
> ```

Open your browser and navigate to [http://localhost:42000](http://localhost:42000) and you should receive

> ```json
> {
>   "message": "Hello from /"
> }
> ```

#### Adding middleware

Any middleware you write can be added to any route. Create a directory named `middlewares` in the project root directory and create a file named `demo.js` inside of it. Paste the following code:

> ```javascript
> module.exports = async function (request, response, next) {
> 
>     // We'll be adding a random double to the locals of 
>     // the response object and grab it from the route for /
>     response.locals.random = Math.random()
> 
>     // Invoke the next() method to process other middlewares
>     next()
> }
> ```

Now go back and modify `routes/GET/index.js` as follows:

> ```javascript
> const middlewares = require('express-plumber').loadMiddlewares()
> 
> module.exports = {
>     middlewares: [
>         // The demo middleware was loaded and is now available
>         middlewares.demo,
>     ],
> 
>     // Ignore it for now, we'll get to it in a bit, still
>     parametrizePath: false,
> 
>     // This is the callback that will be exectued by express
>     // when / is being requested
>     callback: async (request, response, next) => {
> 
>         try {
>             response.json({
>                   message: `Hello from ${request.originalUrl}.`,
>                   random: response.locals.random
>             })
>         } catch (exception) { // Todo: Implement error handling
>             console.log(exception)
>         }
> 
>     }
> }
> ```

Refresh [http://localhost:42000](http://localhost:42000) and you should see a new random every refresh

> ```json
> {
>   "message": "Hello from /",
>   "random": 0.7689725270201255
> }

---

## Utility functions

### Load some other dependency

> ```javascript
> const plumber = require('express-plumber')
> 
> const packageDotJson = plumber.require('@/package.json')
> console.log(packageDotJson)
> ```

Result: 

```
{
    name: 'plumber-express',
    version: '0.1.0',
    [...]
}
 ```

<!--

The packages provides the utilities to split routes into files and 
directories corresponding that then matches the route path.

#### Examples

| Request           | Source file path              | Request method |  Parsed route path |
| :-                | :-                            | :-             | :-                 |
| `GET /`           | routes/GET/index.js           | GET            | /                  |
| `GET /user`       | routes/GET/user/index.js      | GET            | /:user             |
| `GET /user/1`     | routes/GET/user/id.js         | GET            | /:user/:id         |
| `POST /user`      | routes/POST/user/index.js     | POST           | /:user             |




## Functions

### `loadRoutes(routeDirectory)`

Loads all route 

-->