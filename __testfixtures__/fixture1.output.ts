const rspack = require('@rspack/core');

module.exports = {
  plugins: [
    new rspack.CssExtractRspackPlugin({
      // ...
    }),
  ],
  module: {
    rules: [{
      test: /\.css$/i,
      use: [rspack.CssExtractRspackPlugin.loader, 'css-loader'],
      type: 'javascript/auto',
    }, ],
  },
};