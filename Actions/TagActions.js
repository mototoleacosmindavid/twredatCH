const GenericActions = require('./GenericActions');
const app = require('./../Server/App')
const ValidateRequest = require('../Middleware/ValidateRequest');
const Joi = require('joi');
const ServerError = require('../Server/ServerError');
const Authorization = require('../Middleware/Authentication');
const Tag = require("../Db/Tag");

const RequestValidations = {
    Add: new ValidateRequest({
        content: Joi.string().min(3).max(31).required()
    }),
    GetTagById: new ValidateRequest({
        tag_id: Joi.number().min(1).required()
    }),
    GetTagsByUserId: new ValidateRequest({
        user_id: Joi.number().min(1).required()
    }),
    DeleteTagAssociationOfUserByContent: new ValidateRequest({
        content: Joi.string().min(3).max(31).required()
    })
}

class TagActions extends GenericActions {
    constructor() {
        super('/tags');

        app.post(this.GetActionPath('/'),
            sr => RequestValidations.Add.bodyJsonCheck(sr),
            Authorization.run,
            sr => {
                Tag.add(sr.user["ID"], sr.body["content"])
                    .then(result => sr.sendJSON(result))
                    .catch(e => ServerError.send(sr, e))
            }
        )

        app.get(this.GetActionPath('/'),
            Authorization.run,
            sr => {
                if (false === (sr.query && 1 <= Object.keys(sr.query).length)) {
                    Tag.getAll()
                        .then(r => sr.sendJSON(r))
                        .catch(e => ServerError.send(sr, e))
                    return
                }
                if (false === RequestValidations.GetTagById.queryParamsCheck(sr))
                    return;
                Tag.getByTagId(sr.query["tag_id"])
                    .then(r => sr.sendJSON(r))
                    .catch(e => ServerError.send(sr, e))
            }
        )

        app.get(this.GetActionPath('/users'),
            Authorization.run,
            sr => {
                Tag.getTagsOfUserByUserId(sr.user['ID'])
                    .then(r => sr.sendJSON(r))
                    .catch(e => ServerError.send(sr, e))
            }
        )
        app.get(this.GetActionPath('/popular'),
            sr => {
                Tag.getMostPopularTags()
                    .then(r => sr.sendJSON(r))
                    .catch(e => ServerError.send(sr, e))
            }
        )
        app.delete(this.GetActionPath('/users'),
            sr => RequestValidations.DeleteTagAssociationOfUserByContent.bodyJsonCheck(sr),
            sr => {
                Tag.deleteTagByUserId(sr.user['ID'], sr.body['content'])
                    .then(r => sr.sendJSON(r))
                    .catch(e => ServerError.send(sr, e))
            }
        )
    }
}

module.exports = TagActions