const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  // entry: './main.js',
  entry: './main_ol.js',
  // entry: './main_leaf.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    // filename: 'main.js'
    filename: 'main_ol.js'
    // filename: 'main_leaf.js'
  },
  devtool: 'source-map',
  devServer: {
    port: 3000,
    clientLogLevel: 'none',
    stats: 'errors-only'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin([{from: 'data', to: 'data'}]),
    new HtmlPlugin({
      // template: 'index.html'
      template: 'index_ol.html'
      // template: 'index_leaf.html'
    })
  ]
};
