const path = require("path");
const fs = require("fs-extra");
const { getAndPatchGivenReactDOMVersion } = require("./utils");

(async () => {
  const targetDir = await getAndPatchGivenReactDOMVersion(path.resolve(__dirname, "staging-area"), "16.8.6");
  await fs.copy(targetDir, path.resolve(__dirname, "../target"))

  console.log("Done!");
})();
