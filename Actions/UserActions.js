const GenericActions = require('./GenericActions');
const app = require('./../Server/App')
const User = require('./../Db/User')
const ValidateRequest = require('../Middleware/ValidateRequest');
const Joi = require('joi');
const ServerError = require('../Server/ServerError');
const Authorization = require('../Middleware/Authentication');

const RequestValidations = {
    Register: new ValidateRequest({
        email: Joi.string().email().min(3).max(30).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
        first_name: Joi.string().min(3).max(30).required(),
        last_name: Joi.string().min(3).max(30).required(),
        reddit_username: Joi.string().min(3).max(30).required(),
        reddit_password: Joi.string().min(3).max(30).required()
    }),
    Login: new ValidateRequest( {
        email: Joi.string().email().min(3).max(30).required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
    })
}

class UsersActions extends GenericActions {
    constructor() {
        super('/users');

        app.post(this.GetActionPath('/register'), sr => RequestValidations.Register.bodyJsonCheck(sr), sr => {
            User.register(sr.body["email"], sr.body["password"],
                sr.body["first_name"], sr.body["last_name"],
                sr.body["reddit_username"], sr.body["reddit_password"])
                .then(result => {
                    let {pass, ...userWithoutPassword} = result
                    let responseObject = {
                        user: userWithoutPassword,
                        token: Authorization.getToken(userWithoutPassword)
                    }
                    sr.sendJSON(responseObject)
                })
                .catch(e => ServerError.send(sr, e))
        })

        app.post(this.GetActionPath('/login'), sr => RequestValidations.Login.bodyJsonCheck(sr), (sr) => {
            User.login(sr.body["email"], sr.body["password"])
                .then(result => {
                    let {pass, ...userWithoutPassword} = result
                    let responseObject = {
                        user: userWithoutPassword,
                        token: Authorization.getToken(userWithoutPassword)
                    }
                    sr.sendJSON(responseObject)
                })
                .catch(e => ServerError.send(sr, e))
        })
    }

}
module.exports = UsersActions