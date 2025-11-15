const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = getDefaultConfig(__dirname);

  process.env.EXPO_ROUTER_APP_ROOT = 'app';

  return config;
})();
