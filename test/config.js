module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine-jquery', 'jasmine'],
    files: ['src/editor.js', 'test/editor.js'],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true
  });
};
