const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/nexMap.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    iife: false,
    //clean: true
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
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
  /*plugins: [new ESLintPlugin({
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  })],*/
};