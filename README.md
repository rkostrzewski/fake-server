# Fake Server

## Overview

Fake Server provides the ability to create endpoint to http requests that returns prepared responses based on invocations.

## Usage

1. Install [NodeJS](https://nodejs.org/en/) > 6.6.0 if not present.
2. Open terminal in project folder and run `npm i` to install dependencies.
3. Configure Fake Server using config file. (See below).
4. Run server using `npm run start`.

## Config File

Configuration is read from `config.json` file. All files paths are resolved relative to config file.
Structure of the file is defined below:

```javascript
{
    "http": {
        "port": 8080 // port to use for http connections
    },
    "https": {
        "enable": false, // set to true to start https server 
        "port": 433, // port to use for https connections
        "privateKey": "server.key", // path to private key for https
        "cert": "server.cer" // path to certificate for https
    },
    "services": [] // array of services to fake, see below for more info
}
```

Each service defined in `services` field should look like this:

```javascript
{
            "path": "/", // enpoint on which service will be created
            "method": "post", // http method lowercase
            "baseValidations": { 
                "errorHeaders": "error_headers.json", // path to JSON file containing headers used for error response
                "errorBody": "error_body.txt", // path to file containing body used for error response
                "validations": [] // array of scripts used for checking if request is valid. See Validations section for further information.
            },
            "responses": [
                {
                    "headers": "good_headers.json", // path to JSON file containing headers used for this response
                    "body": "good_body.json", // path to file containing body used for this response
                    "statusCode": 200,
                    "validations": [], // array of scripts used for checking if response can be used for request. See Validations section for further information.
                    "transformations": [] // array of paths to NodeJS modules that will be used for response transformation. See Transformations section for further information.
                }
            ]
        }
```

If any script from `baseValidations.validations` fails error response will be sent.
First response with all scripts from it's validation scripts passing is used as request's response and the rest will be ignored.

## Validations

`validations` arrays should contain JavaScript code used for checking if request is valid or response can be applied.
Each script is run in scope where two variables are available - `body` and `headers` containing data of original request.
Scripts should return boolean value or a number. When boolean value is returned it will be used for determining if validation passed. 
When validation script for `baseValidations` returns a number the result will be marked as invalid and the number will be used as status code of response.

Example scripts:

```JavaScript
[
    "body.data.foo === 'some text'",
    "!!body.data.bar",
    "body.data.bar !== undefined",
    "headers['cookie'] !== '123456'",
    "headers['authorization'] === 'Bearer Token' ? true : 401"
]
```

## Transformations

`transformations` arrays shuold contain paths to modules exporting a function that will transform the response.
The function should take in two parameters:

    - `request` - original request provided by express
    - `preparedResponse` - object containing fields:
        - `statusCode` - status code of the response
        - `headers` - JavaScript object containing headers of the response
        - `body` - string containing body of the response

Transformation are executed in same order as provided in JSON array.

Example:

```JavaScript
module.exports = function(request, preparedResponse) {
    var jsonBody;
    try {
        jsonBody = JSON.parse(preparedResponse.body);
    } catch(e) {
        console.error(e);
        return;
    }

    jsonBody.id = 1;
    preparedResponse.headers['cookie'] = '123456';
}

```

## Usefull scripts

`npm run start` - starts the server,
`npm run watch` - starts the server in watch mode - any changes to files will cause the server to automatically restart,
`npm run debug` - starts the server with Chrome debugging tools attached.
