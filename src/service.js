const console = require('better-console');
const validateReqeust = require('./validate-request');
const sendResponse = require('./send-response');

function Service(serviceConfig) {
    this._serviceConfig = serviceConfig;
}

Service.prototype._handler = function (request, response) {
    console.info(this._serviceConfig.method + ' ' + this._serviceConfig.path);

    let baseValidations = this._serviceConfig.baseValidations || {};
    let validationScripts = baseValidations.validations || [];
    let baseValidationResults = validateReqeust(validationScripts, request);
    let invalidValidationIndex = baseValidationResults.findIndex(vr => !vr.isValid);

    if (invalidValidationIndex > -1) {
        console.error('Base Validation failed. Failed scripts:');
        baseValidationResults.filter(vr => !vr.isValid).forEach(vr => console.error('- ' + vr.script));

        let statusCode = baseValidationResults[invalidValidationIndex].result || 500;
        sendResponse(request, response, {
            statusCode: statusCode,
            headersPath: baseValidations.errorHeaders,
            bodyPath: baseValidations.errorBody
        });
        return;
    }

    let responses = this._serviceConfig.responses;

    for (var i = 0; i < responses.length; i++) {
        if (this._tryToSendResponse(request, response, responses[i])) {
            return;
        }
    }

    console.error('No response found! Sending error...');
    sendResponse(request, response, {
        statusCode: 500,
        headersPath: baseValidations.errorHeaders,
        bodyPath: baseValidations.errorBody
    });
};

Service.prototype._tryToSendResponse = function (request, response, responseCheck) {
    let validationScripts = responseCheck.validations || [];
    let validationResults = validateReqeust(validationScripts, request);
    let failedValidationIndex = validationResults.findIndex(vr => !vr.isValid);
    if (failedValidationIndex > -1) {
        let failedResult = validationResults[failedValidationIndex];
        console.warn('Validation Script: ' + failedResult.script);
        console.warn('Trying next response...');
        return false;
    }

    sendResponse(request, response, {
        statusCode: responseCheck.statusCode,
        headersPath: responseCheck.headers,
        bodyPath: responseCheck.body
    }, responseCheck.transformations);
    return true;
}

Service.prototype.register = function (app) {
    let method = this._serviceConfig.method;
    let path = this._serviceConfig.path;
    app[method](path, this._handler.bind(this));
};

module.exports = Service;