const http = require('http')
const RequestResponse = require("./RequestResponse");
const ServerError = require("./ServerError");
const ServerErrorTypes = require('./ServerErrorTypes')

class App {
    static #server = undefined
    static port = undefined
    static #routes = {
        get: {},
        post: {},
        put: {},
        delete: {}
    }

    static allRoutes() {
        let routeStrings = [];
        let verbs = Object.keys(this.#routes)
        for (let i = 0; i < verbs.length; i++) {
            let urlsForVerb = Object.keys(this.#routes[verbs[i]])
            for (let j = 0; j < urlsForVerb.length; j++) {
                routeStrings.push(`${verbs[i]} ${urlsForVerb[j]}`)
            }
        }
        return routeStrings
    }

    static listen(PORT, callbackOnListen) {
        if (App.#server !== undefined) {
            console.log('Server already initialised!')
            return
        }
        App.#server = http.createServer(async (req, res) => {
            const headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
                'Access-Control-Max-Age': 2592000,
                "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
            }
            if (req.method === 'OPTIONS') {
                res.writeHead(204, headers);
                res.end();
                return;
            }
            let sr = new RequestResponse(req, res)
            if (sr.method !== 'GET') {
                sr.getSimpleBody()
                    .then(body => {
                        sr.simpleBody = body
                        App.#handle(sr)
                    })
                    .catch(err => ServerError.send(sr, err))
                return
            }
            App.#handle(sr)
        })
        App.port = PORT
        App.#server.listen(PORT, callbackOnListen)
    }

    static get(url, ...actions) {
        this.#addAction('get', url, actions)
    }

    static post(url, ...actions) {
        this.#addAction('post', url, actions)
    }

    static put(url, ...actions) {
        this.#addAction('put', url, actions)
    }

    static delete(url, ...actions) {
        this.#addAction('delete', url, actions)
    }

    static next() {
        return true
    }

    /**
     *
     * @param {string} httpMethod
     * @param {string} url
     * @param actions
     */
    static #addAction(httpMethod, url, actions) {
        if (undefined !== App.#routes[httpMethod][url]) {
            console.log(`Overriding route at ${httpMethod.toUpperCase()} ${url}`)
        }
        App.#routes[httpMethod][url] = actions
    }


    static #handle(sr) {
        if (false === sr.isHttpMethodSupported()) {
            ServerError.send(sr, ServerErrorTypes.HTTP_METHOD_NOT_SUPPORTED)
            return
        }
        let actions = App.#routes[sr.method.toLowerCase()][sr.path]
        if (undefined === actions) {
            let err = ServerErrorTypes.SERVER_ROUTE_NOT_IMPLEMENTED
            err.helper = {
                path: sr.path,
                method: sr.method
            }
            ServerError.send(sr, err)
            return
        }
        if (false === Array.isArray(actions)) {
            let err = ServerErrorTypes.SERVER_INTERNAL_ERROR
            err.helper = {
                description: "Bad route set"
            }
            ServerError.send(sr, err)
            return
        }
        for (let i = 0; i < actions.length; i++) {
            let action = actions[i]
            let next = action(sr)
            if (next !== true)
                break
        }

    }
}

module.exports = App