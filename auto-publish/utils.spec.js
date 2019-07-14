const {
  getAndPatchGivenReactDOMVersionWithGivenRHLVersion
} = require("./utils");
const { resolve } = require("path");
const child_process = require("child_process");
const fs = require("fs-extra");

/**
 * @type {typeof child_process}
 */
const actualChildProcess = jest.requireActual("child_process");

jest.mock(
  "child_process",
  () => {
    return {
      execFile: jest.fn()
    };
  },
  {
    virtual: true
  }
);

describe("Auto publish utils", () => {
  afterEach(() => {
    // @ts-ignore
    child_process.execFile.mockClear();
  });

  test("Run getAndPatchGivenVersion and don't crash", async () => {
    const stagingArea = resolve(__dirname, "staging-area-for-test");
    await fs.emptyDir(stagingArea);
    await fs.rmdir(stagingArea);

    // @ts-ignore
    child_process.execFile.mockImplementation((...args) => {
      // @ts-ignore
      return actualChildProcess.execFile(...args);
    });

    await getAndPatchGivenReactDOMVersionWithGivenRHLVersion(stagingArea, "16.8.6", "4.12.2", "test-org-bnaya");
  });

//   test("doesReactDOMHasNewerVersionThanUs - no! RC is ready", async () => {
//     const returnValues = [
//       { rc: "2.0.0" },
//       { latest: "1.0.0" },
//       { latest: "2.0.0" }
//     ];

//     // @ts-ignore
//     child_process.execFile.mockImplementation((a, b, c, callback) => {
//       callback(
//         false,
//         JSON.stringify({ data: { "dist-tags": returnValues.shift() } })
//       );
//     });

//     expect(await doesReactDOMHasNewerVersionThanUs()).toEqual(false);

//     expect(child_process.execFile).toMatchSnapshot("Correct params passed to execFile");
//   });

//   test("doesReactDOMHasNewerVersionThanUs - no! our latest is updated", async () => {
//     const returnValues = [
//       { rc: "1.0.0" },
//       { latest: "2.0.0" },
//       { latest: "2.0.0" }
//     ];

//     // @ts-ignore
//     child_process.execFile.mockImplementation((a, b, c, callback) => {
//       callback(
//         false,
//         JSON.stringify({ data: { "dist-tags": returnValues.shift() } })
//       );
//     });

//     expect(await doesReactDOMHasNewerVersionThanUs()).toEqual(false);
//   });

//   test("doesReactDOMHasNewerVersionThanUs - yes! 2.0.0", async () => {
//     const returnValues = [
//       { rc: "1.1.0" },
//       { latest: "1.0.0" },
//       { latest: "2.0.0" }
//     ];

//     // @ts-ignore
//     child_process.execFile.mockImplementation((a, b, c, callback) => {
//       callback(
//         false,
//         JSON.stringify({ data: { "dist-tags": returnValues.shift() } })
//       );
//     });

//     expect(await doesReactDOMHasNewerVersionThanUs()).toEqual("2.0.0");
//   });
});
