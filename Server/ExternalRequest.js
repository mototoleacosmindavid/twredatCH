const https = require('https');

class ExternalRequest {
    static getFromUrl = (givenURL) => {
        return new Promise((resolve, reject) => {
            https.get(givenURL, (resp) => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    resolve(data)
                });

            }).on("error", (err) => {

                reject(err)
            });
        })
    }
    static extractObjectWithKeys(obj, ...keys) {
        let res = {}
        for (let i = 0; i < keys.length; i++)
            res[keys[i]] = obj[keys[i]]
        return res
    }
}

module.exports = ExternalRequest