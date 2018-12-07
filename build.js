const {writeFileSync, readFileSync} = require('fs');
const pkg = require('react-dom/package');
const self = require('./package');
const patch = require('./patch');

self.version = pkg.version;
self.dependencies = pkg.dependencies;

writeFileSync('package.json', JSON.stringify(self, null, 2));

const patched = patch(readFileSync('./node_modules/react-dom/cjs/react-dom.development.js').toString())
if (!patched) {
  throw new Error('could not patch react-dom')
}

writeFileSync('./dist/react-dom.hot.development.js', patched);
writeFileSync('./dist/react-dom.hot.production.js', readFileSync('./node_modules/react-dom/cjs/react-dom.production.min.js').toString());

