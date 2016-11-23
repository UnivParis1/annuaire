const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack_common.config.js'); // the settings that are common to prod and dev

module.exports = function(options) {
    return webpackMerge(commonConfig(options), {
        entry: [
            'webpack-dev-server/client?https://0.0.0.0:8080',
            'webpack/hot/only-dev-server',
        ],
        output: {
            filename: '[name].js'
        },
        devtool: 'source-map',
  });
};