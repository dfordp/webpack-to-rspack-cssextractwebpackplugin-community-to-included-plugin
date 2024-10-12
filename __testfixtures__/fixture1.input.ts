// Step 1: Replace the import of 'mini-css-extract-plugin' with '@rspack/core'
const CssExtractWebpackPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    // Step 2: Replace 'new CssExtractWebpackPlugin' with 'new rspack.CssExtractRspackPlugin'
    new CssExtractWebpackPlugin({
      // ...
    }),
  ],
  module: {
    rules: [{
      test: /\.css$/i,
      // Step 3: Replace 'CssExtractWebpackPlugin.loader' with 'rspack.CssExtractRspackPlugin.loader'
      use: [CssExtractWebpackPlugin.loader, 'css-loader'],
      // Step 4: Add 'type: "javascript/auto"' to the rule object
    }, ],
  },
};