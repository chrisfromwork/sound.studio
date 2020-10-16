const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development', // todo change back to production
  devtool: 'source-maps'
});