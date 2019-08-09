const path = require("path");
const fs = require("fs-extra");
const { getAndPatchGivenReactDOMVersionWithGivenRHLVersion } = require("./utils");

(async () => {
  const targetDir = await getAndPatchGivenReactDOMVersionWithGivenRHLVersion(path.resolve(__dirname, "staging-area"), "16.9.0", "4.12.10", "@hot-loader/react-dom");
  await fs.copy(targetDir, path.resolve(__dirname, "../target"))

  console.log("Done!", { targetDir });
})();
