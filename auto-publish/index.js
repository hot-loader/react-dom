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
    "test-org-bnaya-2",
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
      "test-org-bnaya-2"
    );

    console.info("don't really publish yet", { patchedPackageDir });

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
})();
