if (process.env.NODE_ENV === 'production') {
  module.exports = require('./index.prod.js');
} else {
  module.exports = require('./index.dev.js');
}
