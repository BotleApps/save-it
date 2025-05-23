module.exports = {
  globDirectory: 'dist/',
  globPatterns: [
    '**/*.{js,ico,html,json,css,png,jpg}'
  ],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [
    /^utm_/,
    /^fbclid$/
  ]
};
