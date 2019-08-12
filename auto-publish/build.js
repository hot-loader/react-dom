const path = require("path");
const fs = require("fs-extra");
const { getAndPatchGivenReactDOMVersionWithGivenRHLVersion } = require("./utils");

(async () => {
  const targetDir = await getAndPatchGivenReactDOMVersionWithGivenRHLVersion(
    path.resolve(__dirname, "staging-area"),
    "^16.8.6",
    "^4.12.3",
    "hot-loader"
  );
  await fs.copy(targetDir, path.resolve(__dirname, "../target"))

  console.log("Done!", { targetDir });
})();