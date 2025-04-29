const path = require('path');
// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      // 1) Polyfill fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        assert: require.resolve('assert'),
        http:   require.resolve('stream-http'),
        https:  require.resolve('https-browserify'),
        os:     require.resolve('os-browserify/browser'),
        url:    require.resolve('url'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        zlib:   require.resolve('browserify-zlib'),
        util:   require.resolve('util/'),
      };

      // 2) Alias the exact import path for strict ESM resolution
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'process/browser': require.resolve('process/browser.js'),
      };

      // 3) ProvidePlugin so `process` & `Buffer` are auto-injected
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer:  ['buffer', 'Buffer'],
        })
      );

      return config;
    },
  },
};
