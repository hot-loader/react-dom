const child_process = require("child_process");
const semver = require("semver");
const path = require("path");
const fs = require("fs-extra");

/**
 * Install the given react-dom version, patch it, and return the path to the patched package.
 *
 * @param {string} stagingArea
 * @param {string} version
 * @param {string} rhlVersion
 * @param {string} registryOrg
 */
async function getAndPatchGivenReactDOMVersionWithGivenRHLVersion(
  stagingArea,
  version,
  rhlVersion,
  registryOrg
) {
  const wd = path.resolve(stagingArea, `${version}-${rhlVersion}`);
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
      `react`,
      `react-dom@${version}`,
      `react-hot-loader@${rhlVersion}`,
      "--no-lockfile"
    ],
    originalDir,
    5000
  );

  const nodeModulesPath = path.resolve(originalDir, "node_modules");

  const reactDomVersion = require(path.join(nodeModulesPath,'react-dom','package.json')).version;
  const reactLoaderVersion = require(path.join(nodeModulesPath,'react-hot-loader','package.json')).version;

  console.log('*******');
  console.log(`combining React-DOM@${reactDomVersion} and React-Hot-Loader@${reactLoaderVersion}`);
  console.log('*******');

  const patchedFiles = await patchWork(nodeModulesPath, targetDir, registryOrg);

  if (patchedFiles.length < 2) {
    throw new Error("expected to patch at least 2 files");
  }

  // console.debug(patchedFiles);
  return targetDir;
}

/**
 * The version is actually the combination of react-dom version concatenated with react-hot-loader version.
 * Delimited by -
 * @param {string} distTag
 * @param {string} registryOrg
 */
async function getCurrentVersionState(distTag, registryOrg) {
  const versionString = await getVersionInDistTagOfPackage(
    "@hot-loader/react-dom",
    distTag
  );
  const [reactDOMVersion, reactHotLoaderVersion = "0.0.1"] = (
    versionString || "0.0.1"
  ).split("-");

  return {
    reactDOMVersion,
    reactHotLoaderVersion
  };
}

/**
 * Checks on npm registry if the latest published version of react-dom or react-hot-loader is newer than our latest published package,
 * In the given dist tag, and his rc
 *
 * If an update is needed, return the versions, if not return false+
 * @param {string} reactDOMDistTag
 * @param {string} reactHotLoaderDistTag
 * @param {string} ourRegistryOrg
 * @param {string} rcTagSuffix
 */
async function doesReactDOMOrHotLoaderHasNewerVersionThanUs(
  reactDOMDistTag,
  reactHotLoaderDistTag,
  ourRegistryOrg,
  rcTagSuffix
) {
  const rcTagForThatDistTag = reactDOMDistTag + rcTagSuffix;
  const [
    ourRC,
    ourDistTagVersion,
    reactDOMVersion,
    reactHotLoaderVersion
  ] = await Promise.all([
    getCurrentVersionState(rcTagForThatDistTag, ourRegistryOrg),
    getCurrentVersionState(reactDOMDistTag, ourRegistryOrg),
    getVersionInDistTagOfPackage("react-dom", reactDOMDistTag),
    getVersionInDistTagOfPackage("react-hot-loader", reactHotLoaderDistTag)
  ]);

  if (
    (semver.gt(reactDOMVersion || "0.0.1", ourDistTagVersion.reactDOMVersion) &&
      !semver.gte(ourRC.reactDOMVersion, reactDOMVersion || "0.0.1")) ||
    (semver.gt(
      reactHotLoaderVersion || "0.0.1",
      ourDistTagVersion.reactHotLoaderVersion
    ) &&
      !semver.gte(
        ourRC.reactHotLoaderVersion,
        reactHotLoaderVersion || "0.0.1"
      ))
  ) {
    return {
      reactDOMVersion,
      reactHotLoaderVersion
    };
  }

  return false;
}

/**
 * (In npm) returns the version that the given dist tag points to, on the given package
 * return null if there is no such dist tag
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

  console.log(json.data["dist-tags"]);

  const distTagPointsTo = json.data["dist-tags"][distTag];

  if (!distTagPointsTo) {
    // throw new Error("Given dist tag not found");
    return null;
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
async function execFile(file, args, cwd, timeout = 2000) {
  return new Promise((res, rej) => {
    child_process.execFile(
      file,
      args,
      { timeout, cwd },
      (error, stdout, stderr) => {
        if (error) {
          // console.error({error, stdout, stderr});
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
 * @param {string} originalDirOfPackage
 * @param {string} targetDir
 * @param {string} registryOrg
 */
async function patchWork(originalDirOfPackage, targetDir, registryOrg) {
  const originalDirOfReactDOMPackage = path.resolve(
    originalDirOfPackage,
    "react-dom"
  );
  const originalReactDOMPackageJSON = require(path.resolve(
    originalDirOfReactDOMPackage,
    "package.json"
  ));

  const reactHotLoaderWebpackCode = require(path.resolve(
    originalDirOfPackage,
    "react-hot-loader/webpack"
  ));
  const reactHotLoaderPackageJSON = require(path.resolve(
    originalDirOfPackage,
    "react-hot-loader",
    "package.json"
  ));
  const basePackageJSON = require("../source/package.base.json");

  await fs.mkdirp(targetDir);
  const patchedFiles = await copyAndPatchDirectory(
    originalDirOfReactDOMPackage,
    targetDir,
    (code) => {
      const newCode = reactHotLoaderWebpackCode.default.patch(code);
      if(newCode) {
        return newCode.split('hot-loader/react-dom 4.8+').join(`hot-loader/react-dom ${reactHotLoaderPackageJSON.version}`);
      }
      return newCode;
    }
  );

  // was doing nothing (?)
  // await copyAndPatchDirectory("../source", "../node_modules/react-dom/", "../target");

  basePackageJSON.name = basePackageJSON.name.replace(
    "REGISTRY_ORG_PLACEHOLDER",
    registryOrg
  );

  await fs.writeFile(
    path.resolve(targetDir, "package.json"),
    JSON.stringify(
      filterPackage(
        Object.assign(originalReactDOMPackageJSON, basePackageJSON)
      ),
      null,
      " "
    )
  );

  return patchedFiles;
}

/**
 * @param {string} source
 * @param {string} dest
 * @param {(data: string) => Promise<string>} patchFunction
 */
async function copyAndMaybePatchFile(source, dest, patchFunction) {
  const data = (await fs.readFile(source)).toString();
  const patchedData = await patchFunction(data);
  await fs.writeFile(dest, patchedData || data);

  return patchedData !== data;
}

/**
 * @param {string} source
 * @param {string} target
 * @param {(data: string) => Promise<string>} patchFunction
 */
async function copyAndPatchDirectory(source, target, patchFunction) {
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

      patchedFiles.push(
        ...(await copyAndPatchDirectory(sourceFile, targetFile, patchFunction))
      );
    } else {
      if (await copyAndMaybePatchFile(sourceFile, targetFile, patchFunction)) {
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
  getAndPatchGivenReactDOMVersionWithGivenRHLVersion,
  getVersionInDistTagOfPackage,
  execFile,
  doesReactDOMOrHotLoaderHasNewerVersionThanUs
};
