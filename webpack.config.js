const path = require('path');
const BannerPlugin = require('webpack').BannerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const ChmodWebpackPlugin = require('chmod-webpack-plugin');

const resolve = (dir) => path.join(__dirname, dir);

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: 'production',
  devtool: false,
  target: 'node',
  entry: { index: resolve('src/index.js') },
  output: {
    path: resolve('dist'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: {
          loader: 'raw-loader',
          options: {
            esModule: false
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new ChmodWebpackPlugin([{ path: resolve('dist/index.js'), mode: 755 }])
  ]
};
