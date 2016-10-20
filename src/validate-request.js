const vm = require('vm');

function validateRequest(validationScripts, request) {
    const sandbox = {
        body: request.body,
        headers: request.headers
    };

    return validationScripts.map(function (script) {
        let result = runValidationScript(script, sandbox);
        return {
            script: script,
            result: result,
            isValid: typeof (result) === 'number' ? result === 200 : !!result
        };
    });
}

function runValidationScript(scriptContent, sandbox) {
    var context = new vm.createContext(sandbox);
    var script = new vm.Script(scriptContent);
    var result = false;

    try {
        result = script.runInNewContext(context);
    } catch (e) {
        result = false;
    }

    return result;
}

module.exports = validateRequest;