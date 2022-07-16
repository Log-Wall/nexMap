const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, 'src/nexmap.js'),
  //entry: path.join(__dirname, 'src/sandbox.js'),
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
            "@babel/preset-react"
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
  externals: {
    'react': 'react', // Case matters here 
    //'react-dom' : 'reactDOM' // Case matters here 
   }
};