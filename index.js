const console = require('better-console');
const config = require('./config.json');
const Server = require('./src/server');

console.info('Starting...');

new Server(config).startHttp(config);

if (config.https && config.https.enable) {
  new Server(config).startHttps(config);
}
