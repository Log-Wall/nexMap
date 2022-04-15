const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new ESLintPlugin({
    extensions: [ '.tsx', '.ts', '.js', '.jsx' ]
  })],
};