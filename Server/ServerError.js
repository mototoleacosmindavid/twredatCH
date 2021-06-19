const ServerErrorTypes = require('./ServerErrorTypes')

class ServerError {
    /**
     * @param serverRequest
     * @param e
     */
    static send(serverRequest, e) {
        if (undefined === ServerErrorTypes[e]) {
            if (undefined !== e.message) {
                let msg = e.message
                msg = msg.substring(
                    msg.indexOf("#") + 1,
                    msg.lastIndexOf("#")
                )
                serverRequest.sendJSON({
                    message: msg,
                    helper: e.helper
                }, e.statusCode)
                return
            }
            serverRequest.sendJSON(e, 500);
            return
        }

        serverRequest.sendJSON({
            message: e.message,
            helper: e.helper
        }, e.statusCode)
    }
}

module.exports = ServerError