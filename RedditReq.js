const Reddit = require('reddit')

class RedditReq {
    static CLIENT_ID = 'MJTcUUelbIUEsQ'
    static SECRET_KEY = 'Exw9qLKnarA-BeGWC4H_dhMmcn3tWA'
    static USER_AGENT = 'REDAT/1.0.0'
    username
    password
    api
    constructor(username, password) {
        this.username = username
        this.password = password
        this.api = new Reddit({
            username: this.username,
            password: this.password,
            appId: RedditReq.CLIENT_ID,
            appSecret: RedditReq.SECRET_KEY,
            userAgent: RedditReq.USER_AGENT
        })
    }
}

module.exports = RedditReq