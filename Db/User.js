const crypto = require('crypto');
const db = require('./DatabaseService')
const ServerErrorTypes = require('./../Server/ServerErrorTypes')

class User {
    static #passwordHashing(givenPassword) {
        return crypto
            .createHash('md5')
            .update(givenPassword).digest('hex')
    }

    static login(email, password) {
        password = User.#passwordHashing(password)
        const command = {
            sql: 'call Users_Login (?, ?)',
            values: [email, password]
        }
        return new Promise((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => {
                        if (result.length === undefined || result.length === 0) {
                            reject(ServerErrorTypes.BAD_CREDENTIALS)
                        }
                        resolve(result[0][0])
                    }
                )
                .catch(e => {
                    let err = ServerErrorTypes.DATABASE_ERROR
                    err.helper = JSON.stringify(e)
                    reject(e)
                })
        })
    }

    static register(email, password, first_name, last_name) {
        password = User.#passwordHashing(password)
        const command = {
            sql: 'call Users_Register (?, ?, ?, ?)',
            values: [email, password, first_name, last_name]
        }
        return new Promise((resolve, reject) => {
            db.SQLCommand(command)
                .then(result => resolve(result[0][0]))
                .catch(e => {
                    let err = ServerErrorTypes.DATABASE_ERROR
                    err.helper = JSON.stringify(e)
                    reject(e)
                })
        })
    }
}

module.exports = User