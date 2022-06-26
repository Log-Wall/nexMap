const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src/base/nexmap.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: `bundle.min.js`,
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          presets: [
            '@babel/preset-env',
          ],
        },
        loader: 'babel-loader',
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          mangle: false,
          keep_fnames: true,
          toplevel: false,
          keep_classnames: true,
        },
      }),
    ],
  },
};