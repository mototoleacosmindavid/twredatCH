const GenericActions = require('./GenericActions');
const app = require('./../Server/App')
const ValidateRequest = require('../Middleware/ValidateRequest');
const Joi = require('joi');
const ServerError = require('../Server/ServerError');
const ExternalRequest = require("../Server/ExternalRequest");
const SubredditSearchChild = require("../Db/SubredditSearchChild");
const Authentication = require("../Middleware/Authentication");
const RedditReq = require("../RedditReq")
const ServerErrorTypes = require('../Server/ServerErrorTypes')

const BadRedditRequestHandler = (sr, e) => {
    let err = ServerErrorTypes.REDDIT_BAD_REQUEST
    err.helper = JSON.stringify(e)
    ServerError.send(sr, ServerErrorTypes.REDDIT_BAD_REQUEST)
}
const SendUserList = (sr, url) => {
    let redditReq = new RedditReq(sr.user['reddit_username'], sr.user['reddit_password'])

    redditReq.api.get(url)
        .then(result => {
            let children = result['data']['children']
            let resp = []
            children.forEach(x => resp.push(
                {
                    name: x.name,
                    reddit_id: x.id
                }
            ))
            sr.sendJSON(resp)
        })
        .catch(e => BadRedditRequestHandler(sr, e))
}
const ExtractTrafficFromResult = (result) => {
    let keys = Object.keys(result)
    let accessTimes = {}
    for (let i = 0; i < keys.length; i++) {
        accessTimes[keys[i]] = []
        result[keys[i]].forEach(x => accessTimes[keys[i]].push(
            {
                timestamp: x[0],
                date: new Date(x[0]).toLocaleString()
            }
        ))
    }
    return accessTimes
}
const RequestValidations = {
    GetBySearch: new ValidateRequest({
        search_phrase: Joi.string().min(3).max(31).required()
    }),
    GetSubredditJSON: new ValidateRequest({
        subreddit_name: Joi.string().min(3).max(31).required()
    }),
    GetTrafficOfSubreddit: new ValidateRequest({
        subreddit_name: Joi.string().min(3).max(31).required()
    }),
    GetModeratorsOfSubreddit: new ValidateRequest({
        subreddit_name: Joi.string().min(3).max(31).required()
    })
}

class SubredditActions extends GenericActions {
    constructor() {
        super('/subreddits');
        app.get(this.GetActionPath('/moderators'),
            Authentication.run,
            sr => RequestValidations.GetModeratorsOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']
                let url = `/r/${subreddit_name}/about/moderators`

                SendUserList(sr, url)
            })
        app.get(this.GetActionPath('/contributors'),
            Authentication.run,
            sr => RequestValidations.GetModeratorsOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']
                let url = `/r/${subreddit_name}/about/contributors`

                SendUserList(sr, url)
            })
        app.get(this.GetActionPath('/banned'),
            Authentication.run,
            sr => RequestValidations.GetModeratorsOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']
                let url = `/r/${subreddit_name}/about/banned`

                SendUserList(sr, url)
            })
        app.get(this.GetActionPath('/wikibanned'),
            Authentication.run,
            sr => RequestValidations.GetModeratorsOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']
                let url = `/r/${subreddit_name}/about/wikibanned`

                SendUserList(sr, url)
            })
        app.get(this.GetActionPath('/wikicontributors'),
            Authentication.run,
            sr => RequestValidations.GetModeratorsOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']
                let url = `/r/${subreddit_name}/about/wikicontributors`

                SendUserList(sr, url)
            })
        app.get(this.GetActionPath('/traffic'),
            Authentication.run,
            sr => RequestValidations.GetTrafficOfSubreddit.queryParamsCheck(sr),
            sr => {
                let subreddit_name = sr.query['subreddit_name']

                let redditReq = new RedditReq(sr.user['reddit_username'], sr.user['reddit_password'])

                redditReq.api.get(`/r/${subreddit_name}/about/traffic`)
                    .then(result => {
                        let accessTimes = ExtractTrafficFromResult(result)
                        sr.sendJSON(accessTimes)
                    })
                    .catch(e => BadRedditRequestHandler(sr, e))

            }
        )

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
                    sr.sendJSON({children: arr, postNo: children.length})
                })
                    .catch(e => ServerError.send(sr, e))
            })

    }
}

module.exports = SubredditActions