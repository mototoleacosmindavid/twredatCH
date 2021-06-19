const GenericActions = require('./GenericActions');
const app = require('./../Server/App')
const ValidateRequest = require('../Middleware/ValidateRequest');
const Joi = require('joi');
const ServerError = require('../Server/ServerError');
const ExternalRequest = require("../Server/ExternalRequest");
const SubredditSearchChild = require("../Db/SubredditSearchChild");


const RequestValidations = {
    GetBySearch: new ValidateRequest({
        search_phrase: Joi.string().min(3).max(31).required()
    }),
    GetSubredditJSON: new ValidateRequest({
        subreddit_name: Joi.string().min(3).max(31).required()
    })
}

class SubredditActions extends GenericActions {
    constructor() {
        super('/subreddits');

        app.get(this.GetActionPath('/search'),
            sr => RequestValidations.GetBySearch.queryParamsCheck(sr),
            sr => {
                let url = `https://www.reddit.com/subreddits/search.json?q=${sr.query['search_phrase']}`
                console.log(url)
                ExternalRequest.getFromUrl(url)
                    .then(result => {
                        result = JSON.parse(result)
                        let children = result['data']['children']
                        let arr = []
                        for (let i = 0; i < children.length; i++) {
                            let child = new SubredditSearchChild(children[i]['data'])
                            child.description = child.description.substring(0, 200)
                            arr.push(child)
                        }
                        sr.sendJSON(arr)
                    })
                    .catch(e => ServerError.send(sr, e))
            }
        )

        app.get(this.GetActionPath(''),
            sr => RequestValidations.GetSubredditJSON.queryParamsCheck(sr)
            , sr => {
                let url = `https://www.reddit.com/r/${sr.query['subreddit_name']}.json`
                ExternalRequest.getFromUrl(url).then(result => {
                    result = JSON.parse(result)
                    let children = result['data']['children']
                    let arr = []
                    for (let i = 0; i < children.length; i++) {
                        let child = children[i]['data']
                        child = ExternalRequest.extractObjectWithKeys(child,
                            "score", "num_comments", "distinguished", "upvote_ratio", "title")
                        arr.push(child)
                    }
                    sr.sendJSON({ children : arr, postNo: children.length })
                })
                    .catch(e => ServerError.send(sr, e))
            })

    }
}

module.exports = SubredditActions