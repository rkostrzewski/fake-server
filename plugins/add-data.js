const console = require('better-console');

module.exports = (request, preparedResponse) => {
    var body;
    try {
        body = JSON.parse(preparedResponse.body);
    } catch (err) {
        console.error(err);
        return;
    }

    body.custom_data = request.body.custom_data;

    preparedResponse.body = JSON.stringify(body);
}