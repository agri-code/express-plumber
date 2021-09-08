const fs = require('fs')
const path = require('path')
const recursiveRead = require('fs-readdir-recursive')

module.exports = {

    /**
     * Returns the application `cwd` (or the main code entry file)
     * @returns {string} The application `cwd`
     */
    appRootDir() {
        return path.dirname(require.main.filename)
    },

    /**
     * Loads all routes from directory, see {@link resolveRootAlias resolveRootAlias}
     * @param {string} routeDirectory Path to the directory containing the route files, defaults to `@/routes`
     * @returns {routeEntry} Route objects suitable to apply to any express Router or application instance by {@link applyRoutes}
     */
    loadRoutes(routeDirectory = '@/routes') {
        routeDirectory = this.resolveRootAlias(routeDirectory)
        const routes = []

        // Ok, we iterater over all methods directories
        if (! fs.existsSync(routeDirectory)) {
            throw new Error(`Could not find directory \`${routeDirectory}\` containing routes`)
        }

        // Get a list of files in the schemataDirectory
        const routeFilesByMethodAndParameter = recursiveRead(routeDirectory);
        const cleanedRoutesPath = routeFilesByMethodAndParameter.map(e => e.substr(0, e.length - 3).replaceAll('\\', '/'))

        const results = []

        // Counter to keep track of index
        let i = 0

        // Iterate over the transformed paths
        cleanedRoutesPath.forEach(rf => { // Split it
            const parts = rf.split('/')
            const requirePath = path.join(routeDirectory, routeFilesByMethodAndParameter[i])
            const routeMethod = parts[0]
            if (![
                "get",
                "put",
                "post",
                "patch",
                "delete"
            ].includes(routeMethod.toLocaleLowerCase())) {
                throw new Error(`Unknown or unsupported request method ${routeMethod}`)
            }
            let pathParts = parts.filter(e => e !== 'index').splice(1, parts.length - 1)


            // Load dependency
            const route = require(requirePath)

            // Check for path parameter
            let absolutePath = `/${
                pathParts.join('/')
            }`

            // Do construct the path if path is not parametrized
            if (! route.parametrizePath) { // If we deal with more than just one segment
                if (pathParts.length > 1) {
                    absolutePath = '/' + pathParts.map(e => e).splice(0, pathParts.length - 1).join('/') + '/:' + pathParts.map(e => e).splice(pathParts.length - 1, pathParts.length - 1)
                } else { // Else join it to url
                    absolutePath = `/${
                        pathParts.join('/')
                    }`
                }
                // We are dealing with a fully parametrized path for generic routes
            } else {
                absolutePath = `/${
                    pathParts.map(e => `:${e}`).join('/')
                }`
            }

            // Override anything we came up with if the path has been explicitly set
            if (route.path && route.path.length > 0) {
                absolutePath = route.path
            }

            // Increment counter
            i++

            // Push it into the results
            results.push({
                method: routeMethod.toLowerCase(),
                path: absolutePath,
                route,
                priority: route.priority ? route.priority : 0
            })
        })
        return results.sort((b, a) => (a.priority > b.priority) ? 1 : ((b.priority > a.priority) ? -1 : 0))
    },

    /**
     * @typedef routeEntry
     * @type {object}
     * @property {string} method Request method 
     * @property {string?} path Route path that overrides the computed path altogether
     * @property {callback} 
     */

    /**
     * Applies them to express application or router object
     * @param {object} appOrRouter 
     * @param {string} routesDirectory 
     * @returns {object} Plumber
     */
    applyRoutes(appOrRouter, routes) {
        routes.forEach(routeItem => { // Use the routes on the appropriate methods
            appOrRouter[routeItem.method](routeItem.route.path ? routeItem.route.path : routeItem.path, routeItem.route.middlewares ? routeItem.route.middlewares : [], routeItem.route.callback ? routeItem.route.callback : async function defaultCallback(request, response, next) {
                response.json({
                        message: `Default for ${
                        routeItem.path
                    }`
                })
            })
        })
        return this
    },

    /**
     * Loads routes from directory and applies them to express application or router object, see {@link loadRoutes} and {@link applyRoutes}
     * @param {object} appOrRouter Target express application or router
     * @param {String} routesDirectory Target directory, defaults to '@/routes'
     * @returns {object} Plumber
     */
    loadAndApplyRoutes(appOrRouter, routesDirectory = '@/routes') {
        let routes = this.loadRoutes(routesDirectory)
        this.applyRoutes(appOrRouter, routes)
        return this
    },


    /**
     * Tries to resolve the `@/` alias to the cwd of the process invoking `resolveRootAlias()`
     * @param {string} aliasPath Relative path containing `@/` alias to subdirectories
     * @returns {string} Resolved file or directory path
     * @example const packageJsonPath = plumber.resolveRootAlias(`@/package.json`) // $HOME/src/express-plumber/package.json
     */
    resolveRootAlias(aliasPath) {
        if (aliasPath.includes('@/')) {
            aliasPath = aliasPath.replaceAll('@', this.appRootDir())
        }
        return path.resolve(aliasPath)

    },

    /**
     * Loads and returns an object or array of all middlewares located at `libPath`
     * @param {string} [libPath] Path to the middlewares directory, defaults to `@/middlewares`
     * @param {Array.<string>} [exclusionList] Array of file names exclusions, defaults to `['index.js']`
     * @param {Boolean} [asArray] Return middlewares as an array instead of an object, defaults to `false`
     * @returns {object|Array.<Function>} Object with properties or an array with middlewares
     * @see resolveRootAlias
     */
    loadMiddlewares(libPath = '@/middlewares', exclusionList = ['index.js'], asArray = false) {
        libPath = this.resolveRootAlias(libPath)
        // Make sure the directory exists
        if (! fs.existsSync(libPath)) {
            throw new Error(`Could not find directory \`${libPath}\` containing the required files`)
        }

        // Get a list of files in the schemataDirectory
        const files = fs.readdirSync(libPath).filter(f => !exclusionList.includes(f))

        let returnObject

        // Initialize the return object either as array or actual object, defaults to object
        if (asArray) {
            returnObject = []
        } else {
            returnObject = {}
        }

        // Iterate over every single file
        files.forEach(file => { // Get a model name
            const middlewareFileName = file.split('.')[0]

            // Load the model
            const middleware = require(path.join(libPath, middlewareFileName))

            // Push it to this instance
            returnObject[middlewareFileName] = middleware
        })
        return returnObject
    },

    /**
     * Loads and returns a project dependency
     * @param {string} projectRelativePath The relative path in relation to the process `cwd`
     * @returns {object|function} Loaded dependency
     * @example const packageJson = plumber.require('@/package.json')
     */
    require(projectRelativePath) {
        return require(this.resolveRootAlias(projectRelativePath))
    }
}
