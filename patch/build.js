const {writeFileSync, readFileSync, readdirSync, statSync, mkdirSync} = require('fs');
const pkg = require('react-dom/package');
const self = require('../source/package.base');
const patch = require('./patch');

let patchedFiles = [];

const copyFile = (source, dest) => {
  const data = readFileSync(source).toString();
  const patchedData = patch(data);
  if (patchedData !== data) {
    patchedFiles.push(dest);
  }
  writeFileSync(dest, patchedData || data)
}

const copy = (source, target) => {
  const list = readdirSync(source);
  for (const i of list) {
    //const file =
    const sourceFile = `${source}/${i}`;
    const targetFile = `${target}/${i}`;

    const stat = statSync(sourceFile);
    if (stat.isDirectory()) {
      mkdirSync(`${target}/${i}`);
      copy(sourceFile, targetFile)
    } else {
      copyFile(sourceFile, targetFile);
    }
  }
}

copy('../node_modules/react-dom/', '../target');
copy('../source', '../node_modules/react-dom/', '../target');

writeFileSync('../target/package.json', JSON.stringify(Object.assign(pkg, self), null, 2));

console.log(patchedFiles);

if (patchedFiles.length !== 2) {
  throw new Error('expected to patch 2 file');
}

