const {writeFileSync, readFileSync} = require('fs');
const pkg = require('react-dom/package');
const self = require('./package');
const patch = require('./patch');

self.version = pkg.version;

writeFileSync('package.json', JSON.stringify(self, null, 2));

const patched = patch(readFileSync('./node_modules/react-dom/cjs/react-dom.development.js').toString())
if (!patched) {
  throw new Error('could not patch react-dom')
}

writeFileSync('index.dev.js', patched);
writeFileSync('index.prod.js', readFileSync('./node_modules/react-dom/cjs/react-dom.production.min.js').toString());

