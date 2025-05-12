// Mocha配置文件
module.exports = {
  require: ['@babel/register'],
  extension: ['.js'],
  timeout: 5000,
  ui: 'bdd',
  spec: 'test/**/*.test.js'
};