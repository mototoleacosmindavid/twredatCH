const db = require('./DatabaseService')

class Tag {
    static add(user_id, content) {
        content = content.toLowerCase()
        let command = {
            sql: 'call Tag_Add(?, ?)',
            values: [user_id, content]
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result[0][0]))
                .catch(e => reject(e))
        }))
    }
    static getAll() {
        let command = {
            sql: 'SELECT * FROM tags',
            values: []
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result))
                .catch(e => reject(e))
        }))
    }
    static getByTagId(tag_id) {
        let command = {
            sql: 'SELECT * FROM tags WHERE tags.ID=?',
            values: [tag_id]
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result))
                .catch(e => reject(e))
        }))
    }
    static getTagsOfUserByUserId(user_id) {
        let command = {
            sql: 'SELECT * FROM tags WHERE tags.ID in (SELECT tag_ID from users_tags where user_ID=?)',
            values: [user_id]
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result))
                .catch(e => reject(e))
        }))
    }
    static getMostPopularTags() {
        let command = {
            sql: 'select tags.ID, tags.content as tag_content, count(ut.user_ID) as tag_users_count from tags inner join users_tags ut on tags.ID = ut.tag_ID group by ut.tag_ID order by count(ut.tag_ID) desc',
            values: []
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result))
                .catch(e => reject(e))
        }))
    }
    static deleteTagByUserId(user_id, content) {
        let command = {
            sql: 'delete from users_tags where users_tags.ID=? and tag_ID in (select ID from tags where content=?)',
            values: [user_id, content]
        }
        return new Promise(((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result))
                .catch(e => reject(e))
        }))
    }
}

module.exports = Tag