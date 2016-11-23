'use strict';

var path = require("path"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = function(options) {
    return {
        entry: [
            './app/app.ts'
        ],
        output: {
            path: path.resolve(__dirname, "../build")
        },
        resolve: {
            extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
        },
        module: {
            preloaders: [
                {
                    test: /\.ts$/,
                    loader: 'tslint'
                }
            ],
            loaders: [
                { test: /\.css$/, loader: "style-loader!css-loader" },
                {
                    test: /\.html$/,
                    loader: 'raw',
                },
                {
                    test: /\.ts$/,
                    loader: 'ts'
                },
                {
                    test: /\.(woff2?|svg)$/,
                    loader: 'url?limit=10000'
                },
                {
                    test: /\.(ttf|eot)$/,
                    loader: 'file'
                }
            ]
        },
        plugins: [
            // copy index and inject script tag containing output filename
            new HtmlWebpackPlugin({
                filename: './index.html',
                template: './app/index.html'
            }),
            // copy template from app to build
            new CopyWebpackPlugin([
                {
                    context: 'app/',
                    from: 'template/*', 
                    to: './'
                }
            ]),
            new ngAnnotatePlugin({
                add: true
            })
        ]
    };
}