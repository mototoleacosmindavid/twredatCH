class GenericActions {
    basePath
    constructor(basePath) {
        this.basePath = basePath
    }
    GetActionPath(path) {
        if (path === '/')
            path = ''
        return this.basePath + path;
    }
}

module.exports = GenericActions