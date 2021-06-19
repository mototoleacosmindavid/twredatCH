const jwt = require('jsonwebtoken')
const ServerError = require("../Server/ServerError");

const ServerErrorTypes = require("../Server/ServerErrorTypes");

class Authentication {
    static #tokenSecret = 'SECRET_FOR_JWT_HASHING'
    static #tokenExpirationTimeout = 4 * 3600
    static run(sr) {
        const tokenHeader = sr.req.headers['authorization']
        if (undefined === tokenHeader) {
            ServerError.send(sr, ServerErrorTypes.AUTHORIZATION_HEADER_MISSING)
            return false
        }
        let token = tokenHeader && tokenHeader.split(' ')[1]
        try {
            sr.user = Authentication.verifyToken(token)
            return true
        } catch (e) {
            ServerError.send(sr, ServerErrorTypes.INVALID_AUTH_TOKEN)
            return false
        }
    }
    static getToken(tokenPayload) {
        return jwt.sign(tokenPayload, Authentication.#tokenSecret, { expiresIn: Authentication.#tokenExpirationTimeout})
    }
    static verifyToken(token) {
        return jwt.verify(token, this.#tokenSecret)
    }
    
}

module.exports = Authentication