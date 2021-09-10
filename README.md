# `express-plumber`

Utility to 


- remove the burden of writing  boilerplate code
- speeding up development of express applications
- separating concerns by splitting route and middleware into separate files


by rigorously imposing a convention to adhere to. It provides various functions
 and utitlies to facilitate rapid protoyping and development.

---

__Implemented features__

  - [Loading of middlewares from individual files](#adding-middleware)
  - [Route organization in directories and files](#route-organization-in-directories-and-files). Not happy with the computed path? No problem, just 
    - [override it](#route-path-override)  to match your use case
    - set it's [priority](#route-prioritization) explicitly

__Planned features__

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
>     // Ignore it for now
>     priority: 0,
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
>     // Ignore it for now
>     priority: 0,
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

## Features

__`Convention over configuration`__ is plumber's mantra. By sticking to a given convention we save a ton of time writing configuration centric code.

### Route organization in directories and files

Routes are organized by request method: `GET`, `POST`, `PUT`, `DELETE` and  `PATCH` are currently supported. `plumber.loadAndApplyRoutes()` by default tries to load routes from `` `cwd`/routes `` by traversing and enumerating recursively any directory it comes across.

![Sample directory structure][structure]

#### Example routes

| Request           | Source file path              | Parsed route path | `parametrizePath` |
| :-                | :-                            | :-                | :-: |
| `GET /`           | routes/GET/index.js           |  /                |`false` |
| `GET /user`       | routes/GET/user/index.js      |  /user            |`false` |
| `GET /post/1`     | routes/GET/post/id.js         |  /post/:id        |`false` |
| `POST /post`      | routes/POST/post/index.js     |  /post            | `false` |
| `GET /sso/ZaGe5bQUaD/WCM9CvEg` | routes/GET/sso/account/token.js | /:sso/:account/:token | `true` |

---

### Route prioritization

Routes are loaded as they are being read from disk. This does not always match business logic such as the classical use case: the authentication endpoint. If you need a route to be declared before another route that matches the path, you can do so by raising the desired route's priority.

> The **higher** the priority, the earlier it will be passed to the router or app

Example:

> ```javascript
> const middlewares = require('express-plumber').loadMiddlewares()
> 
> module.exports = {
>     middlewares: [],
>
>     // Ignore it for now
>     priority: 9001, // >9000
>
>     // Route callback
>     callback: async (request, response, next) => {
>     }
> }
> ```

### Route path override

If the convetion of path and parameter name does not meet the use case, you can override the path by setting it in the route file:

> ```javascript
> const middlewares = require('express-plumber').loadMiddlewares()
> 
> module.exports = {
>     middlewares: [],
>
>     // Ignore it for now
>     path: '/meet/:me/:here/:at',
>
>     // Route callback
>     callback: async (request, response, next) => {
>     }
> }
> ```

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

[structure]: directory_structure.png "Logo Title Text 2"