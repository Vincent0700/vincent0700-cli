const path = require('path');
const BannerPlugin = require('webpack').BannerPlugin;
const ChmodWebpackPlugin = require('chmod-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

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
        test: /\.dat$/i,
        use: [
          {
            loader: 'url-loader',
            options: { esModule: false }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new ChmodWebpackPlugin([{ path: resolve('dist/index.js'), mode: 755 }])
    // new BundleAnalyzerPlugin()
  ]
};
