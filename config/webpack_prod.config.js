'use strict';
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack_common.config.js'); // the settings that are common to prod and dev

var ManifestPlugin = require('webpack-manifest-plugin'),
    WebpackMd5Hash = require('webpack-md5-hash'),
    webpack = require('webpack');

module.exports = function (options) {
    return webpackMerge(commonConfig(), {
        output: {
            // Creates a hash name in case of long term cache on browser
            filename: '[chunkhash].[id].chunk.js' 
        },
        plugins: [
            new WebpackMd5Hash(), // creates md5 hash for files output
            new ManifestPlugin(), // Registers files name and puts them into manifest
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
            new webpack.IgnorePlugin(/^(buffertools)$/)
        ]
    });
    
};