const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: ['babel-polyfill', './frontend/index.jsx'],
  output: {
    path: path.join(__dirname, 'views/webpack/'),
    filename: 'bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  }
};
