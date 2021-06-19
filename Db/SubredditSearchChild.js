class SubredditSearchChild {
    subscribers
    description
    display_name
    url

    constructor(obj) {
        this.subscribers = obj.subscribers;
        this.description = obj.description;
        this.display_name = obj.display_name;
        this.url = obj.url;
    }
}
module.exports = SubredditSearchChild