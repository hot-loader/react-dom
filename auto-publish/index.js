const path = require("path");
const fs = require("fs-extra");
const {
  execFile,
  doesReactDOMOrHotLoaderHasNewerVersionThanUs,
  getAndPatchGivenReactDOMVersionWithGivenRHLVersion
} = require("./utils");

// test with https://github.com/verdaccio/verdaccio ???

(async () => {
  const ourDistTag = "latest";

  // TODO: cover more dist tags
  const answer = await doesReactDOMOrHotLoaderHasNewerVersionThanUs(
    "latest",
    "latest",
    "hot-loader",
    "_rc"
  );

  if (answer) {
    console.info("Going to publish!", answer)
    if (
      answer.reactDOMVersion === null ||
      answer.reactHotLoaderVersion === null
    ) {
      throw new Error("Versions to publish by can't be null");
    }

    const patchedPackageDir = await getAndPatchGivenReactDOMVersionWithGivenRHLVersion(
      path.resolve(__dirname, "staging-area"),
      answer.reactDOMVersion,
      answer.reactHotLoaderVersion,
      "hot-loader"
    );

    console.info("The patched code is ready, we don't really auto publish yet", { patchedPackageDir });
    console.warn("Gonna fail the builds until you publish the new version");
    process.exit(1);

    // const publishStdOut = await execFile(
    //   "yarn",
    //   [
    //     "publish",
    //     "--tag",
    //     ourDistTag + "_rc",
    //     "-y",
    //     "--access",
    //     "public",
    //     "--json"
    //   ],
    //   patchedPackageDir,
    //   10000
    // );

    // console.info("Done publishing!", { publishStdOut });
  } else {
    console.info("Nothing to publish");
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
})
