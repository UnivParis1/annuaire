// Gives the possbility to add argument --env=prod to webpack
var argv = require('optimist').argv;
// by default get arg first and node_env next
var env = argv.env || process.env.NODE_ENV;

// Look in ./config folder for webpack.dev.js
switch (env) {
  case 'prod':
  case 'production':
    module.exports = require('./config/webpack_prod.config')({env: 'production'});
    break;
  case 'test':
  case 'testing':
    module.exports = require('./config/webpack_test.config')({env: 'test'});
    break;
  case 'dev':
  case 'development':
  default:
    module.exports = require('./config/webpack_dev.config')({env: 'development'});
}