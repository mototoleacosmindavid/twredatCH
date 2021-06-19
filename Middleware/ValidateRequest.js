const Joi = require('joi')
const ServerError = require("../Server/ServerError")
const ServerErrorTypes = require("../Server/ServerErrorTypes")

class ValidateRequest {
    schemaValue
    schema

    constructor(schemaValue) {
        this.schemaValue = schemaValue
        this.schema = Joi.object(schemaValue)

    }

    bodyJsonCheck(sr) {
        if (false === ValidateRequest.#isJSONString(sr.simpleBody)) {
            let err = ServerErrorTypes.BAD_REQUEST
            err.helper = 'Request body is not JSON parsable'
            ServerError.send(sr, err)
            return
        }
        sr.body = JSON.parse(sr.simpleBody)

        return this.paramValidation(sr, sr.body)
    }
    paramValidation(sr, toBeValidated) {
        let validationError = this.schema.validate(toBeValidated)["error"]
        if (undefined === validationError)
            return true
        let err = ServerErrorTypes.BAD_REQUEST
        err.helper = {
            description: 'Bad request format',
            error: validationError
        }
        ServerError.send(sr, err)
    }
    queryParamsCheck(sr) {
        return this.paramValidation(sr, sr.query)
    }

    static #isJSONString(str) {
        try {
            JSON.parse(str)
            return true
        } catch (e) {
            return false
        }
    }
}

module.exports = ValidateRequest