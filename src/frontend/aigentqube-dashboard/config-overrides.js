const path = require('path');

module.exports = function override(config) {
  config.resolve.alias['./app'] = path.resolve(__dirname, 'src/app.tsx');
  return config;
}
