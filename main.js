const app = require('./Server/App')

const UserActions = require('./Actions/UserActions')
const TagActions = require("./Actions/TagActions");
const SubredditActions = require("./Actions/SubredditAction")

const SERVER_PORT = 4500

app.get('/', sr => {
    sr.sendJSON(app.allRoutes())
})
new UserActions()
new TagActions()
new SubredditActions()



app.listen(SERVER_PORT, () => console.log(`Server is now running on PORT ${SERVER_PORT} ...`))