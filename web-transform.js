// Custom Babel transformer for web platform
module.exports = function() {
  return {
    visitor: {
      // Intercept any reference to ErrorHandler and transform it for web
      Identifier(path, state) {
        const platform = state.opts.platform;
        if (platform === 'web' && path.node.name === 'ErrorHandler') {
          // Replace with a safe reference that's defined in our error-handler.js
          path.node.name = 'window.ErrorHandler';
        }
      }
    }
  };
};
