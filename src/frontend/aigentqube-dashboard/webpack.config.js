const path = require('path');
const webpack = require('webpack');

module.exports = {
  // Existing webpack configuration
  resolve: {
    fallback: {
      "crypto": require.resolve('crypto-browserify'),
      "stream": require.resolve('stream-browserify'),
      "assert": require.resolve('assert'),
      "http": require.resolve('stream-http'),
      "https": require.resolve('https-browserify'),
      "os": require.resolve('os-browserify/browser'),
      "url": require.resolve('url'),
      "buffer": require.resolve('buffer'),
      "process": require.resolve('process/browser')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ]
};
