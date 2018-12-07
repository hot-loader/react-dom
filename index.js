if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/react-dom.hot.production.js');
} else {
  module.exports = require('./dist/react-dom.hot.development.js');
}
