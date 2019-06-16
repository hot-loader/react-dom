const child_process = require("child_process");
const semver = require("semver");
const path = require("path");
const fs = require("fs-extra");
const OUR_RC_DIST_TAG = "rc";
const basePackageJSON = require("../source/package.base.json");
const {
  default: { patch }
  // @ts-ignore
} = require("react-hot-loader/webpack");

/**
 * Install the given react-dom version, patch it, and return the path to the patched package.
 *
 * @param {string} stagingArea
 * @param {string} version
 */
async function getAndPatchGivenReactDOMVersion(stagingArea, version) {
  const wd = path.resolve(stagingArea, version);
  await fs.emptyDir(wd);
  const originalDir = path.resolve(wd, "source");
  const targetDir = path.resolve(wd, "target");

  await fs.mkdirp(originalDir);
  await fs.mkdirp(targetDir);

  // create new local package.json for isolation
  await execFile("yarn", ["init", "-y"], originalDir);
  // install react so avoid yarn peer warnings
  await execFile(
    "yarn",
    [
      "add",
      "react",
      "--no-lockfile"
    ],
    originalDir
  );
  await execFile(
    "yarn",
    [
      "add",
      "react-dom",
      "--no-lockfile"
      //  "--modules-folder", "lalal"
    ],
    originalDir
  );

  const reactDOMPath = path.resolve(originalDir, "node_modules", "react-dom");

  const patchedFiles = await patchWork(reactDOMPath, targetDir);

  if (patchedFiles.length < 2) {
    throw new Error("expected to patch at least 2 files");
  }

  // console.debug(patchedFiles);
  return targetDir;
}

/**
 * Checks on npm registry if the latest published version of react-dom is newer than our latest published package,
 * In the latest or rc dist tags.
 */
async function doesReactDOMHasNewerVersionThanUs() {
  const [ourRCVersion, ourLatestVersion, reactDOMVersion] = await Promise.all([
    getVersionInDistTagOfPackage("@hot-loader/react-dom", OUR_RC_DIST_TAG),
    getVersionInDistTagOfPackage("@hot-loader/react-dom", "latest"),
    getVersionInDistTagOfPackage("react-dom", "latest")
  ]);

  // seems like react-dom have new version!
  if (semver.gt(reactDOMVersion, ourLatestVersion)) {
    if (semver.gte(ourRCVersion, reactDOMVersion)) {
      // Ah no, we have a version waiting in our RC tag
      return false;
    }

    return reactDOMVersion;
  }

  return false;
}

/**
 * (In npm) returns the version that the given dist tag points to, on the given package
 * @param {string} packageName
 * @param {string} distTag
 */
async function getVersionInDistTagOfPackage(packageName, distTag) {
  // yarn info @hot-loader/react-dom@latest --json
  /**
   * @type {import("./interfaces").yarnInfoJsonResponse}
   */
  const json = JSON.parse(
    await execFile("yarn", ["info", packageName, "--json"])
  );
  const distTagPointsTo = json.data["dist-tags"][distTag];

  if (!distTagPointsTo) {
    throw new Error("Given dist tag not found");
  }

  return distTagPointsTo;
}

/**
 * promisified version of child_process.execFile
 *
 * @param {string} file
 * @param {readonly string[] | null | undefined} args
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
async function execFile(file, args, cwd) {
  return new Promise((res, rej) => {
    child_process.execFile(
      file,
      args,
      { timeout: 2000, cwd },
      (error, stdout, stderr) => {
        if (error) {
          rej(error);
        } else {
          res(stdout);
        }
      }
    );
  });
}

/**
 * Apply the needed patches on the given react-dom installation,
 * And put the results to the given targetDir
 * returns the number of file changed
 *
 * @param {string} originalDirOrReactDOMPackage
 * @param {string} targetDir
 */
async function patchWork(originalDirOrReactDOMPackage, targetDir) {
  const pkg = require(path.resolve(originalDirOrReactDOMPackage, "package.json"));

  await fs.mkdirp(targetDir);
  const patchedFiles = await copyAndPatchDirectory(
    originalDirOrReactDOMPackage,
    targetDir
  );

  // was doing nothing (?)
  // await copyAndPatchDirectory("../source", "../node_modules/react-dom/", "../target");

  await fs.writeFile(
    path.resolve(targetDir, "package.json"),
    JSON.stringify(
      filterPackage(Object.assign(pkg, basePackageJSON)),
      null,
      " "
    )
  );

  return patchedFiles;

}

/**
 * @param {string} source
 * @param {string} dest
 */
async function copyAndMaybePatchFile(source, dest) {
  const data = (await fs.readFile(source)).toString();
  const patchedData = await patch(data);
  await fs.writeFile(dest, patchedData || data);

  return patchedData !== data;
}

/**
 * @param {string} source
 * @param {string} target
 */
async function copyAndPatchDirectory(source, target) {
  /** @type {string[]} */
  const patchedFiles = [];

  const list = await fs.readdir(source);

  for (const i of list) {
    const sourceFile = path.resolve(source, i);
    const targetFile = path.resolve(target, i);

    const stat = await fs.stat(sourceFile);
    if (stat.isDirectory()) {
      try {
        await fs.mkdir(path.resolve(target, i));
      } catch (e) {}

      patchedFiles.push(...await copyAndPatchDirectory(sourceFile, targetFile))
    } else {
      if (await copyAndMaybePatchFile(sourceFile, targetFile)) {
        patchedFiles.push(targetFile);
      }
    }
  }

  return patchedFiles;
}

/**
 * @param {{ [x: string]: any; }} pkg
 */
function filterPackage(pkg) {
  return Object.keys(pkg).reduce(
    (acc, key) =>
      key[0] === "_"
        ? acc
        : {
            ...acc,
            [key]: pkg[key]
          },
    {}
  );
}


module.exports = {
  getAndPatchGivenReactDOMVersion,
  doesReactDOMHasNewerVersionThanUs,
  getVersionInDistTagOfPackage,
  execFile
};
