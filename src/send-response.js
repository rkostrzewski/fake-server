const path = require('path');
const fs = require('fs');
const console = require('better-console');

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(data);
        });
    });
}

function applyTransformations(request, preparedResponse, transformations) {
    console.info('Applying transformations...');
    (transformations || [])
        .map(modulePath => path.join('..', modulePath))
        .map(modulePath => {
            console.info(modulePath);
            return require(modulePath)
        })
        .forEach(moduleScript => moduleScript(request, preparedResponse));

    console.info('Applied transformations.');
}

module.exports = (request, response, configResponse, transformations) => {
    console.info('Sending response...');
    console.info('Headers: ' + configResponse.headersPath);
    console.info('Body: ' + configResponse.bodyPath);

    readFile(configResponse.headersPath)
        .then(headers => readFile(configResponse.bodyPath).then(body => {
            return new Promise(resolve => resolve({
                body: body,
                headers: JSON.parse(headers),
                statusCode: configResponse.statusCode
            }));
        })).then(preparedResponse => {
            applyTransformations(request, preparedResponse, transformations);
            response.set(preparedResponse.headers);

            console.info('Status: ' + preparedResponse.statusCode);
            console.log(preparedResponse.statusCode);
            response.status(preparedResponse.statusCode)
                .send(preparedResponse.body);
            console.info('Sent response.');
        })
        .catch(err => {
            console.error(err);
        });

}