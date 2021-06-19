const mariadb = require('mariadb')

class DatabaseService {
    static #connectionURI = {
        host: 'localhost',
        database: 'redat',
        user: 'root',
        password: 'tw1234',
        port: 3306,
        socketTimeout: 0,
        connectTimeout: 80000
    }

    static SQLCommand(query) {
        return new Promise(((resolve, reject) => {
            mariadb.createConnection(DatabaseService.#connectionURI)
                .then(async conn => {
                    let result = await conn.query(query)
                    conn.destroy()
                    resolve(result)
                })
                .catch((err) => reject(err))
        }))
    }
}

module.exports = DatabaseService