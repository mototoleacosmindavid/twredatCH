const url = require("url");
const ServerErrorTypes = require("./ServerErrorTypes");

// noinspection JSDeprecatedSymbols
class RequestResponse {
    static METHODS = {
        'GET': 'GET',
        'POST': 'POST',
        'PUT': 'PUT',
        'DELETE': 'DELETE'
    }

    method
    path
    query
    simpleBody
    body = undefined
    user = undefined

    req
    res

    constructor(req, res) {
        this.req = req
        this.res = res
        this.method = req.method
        this.path = url.parse(this.req.url, true).pathname
        this.query = url.parse(this.req.url, true).query
    }

    getSimpleBody() {
        return new Promise(((resolve, reject) => {
            let body = ''
            this.req.on('data', (chunk) => {
                body += chunk
                if (body.length > 1e7) {
                    reject(ServerErrorTypes.REQUEST_TOO_LARGE)
                }
            })
            this.req.on('end', () => {
                resolve(body)
            })
        }))
    }

    sendJSON(obj, statusCode = 200) {
        this.res.writeHead(statusCode, {'Content-Type': 'application/json'})
        this.res.write(JSON.stringify(obj))
        this.res.end()
    }

    isHttpMethodSupported() {
        return undefined !== RequestResponse.METHODS[this.method]
    }

}

module.exports = RequestResponse