export interface yarnInfoJsonResponse {
  type: "inspect";
  data: {
    name: string;
    "dist-tags": Partial<{
      [k: string]: string
    }>;
    versions: string[];
    time: { [key: string]: string };
    maintainers: Array<{
      name: string;
      email: string;
    }>;
    description: string;
    homepage: string;
    repository: {
      type: string;
      url: string;
    };
    bugs: {
      url: string;
    };
    license: string;
    readmeFilename: string;
    keywords: string[];
    version: string;
  };
  /*
example data:
{
  "type": "inspect",
  "data": {
    "name": "@hot-loader/react-dom",
    "dist-tags": { "latest": "16.8.6" },
    "versions": [
      "16.7.0-alpha.2",
      "16.7.0-alpha.2.1",
      "16.7.0-alpha.2.2",
      "16.7.0-alpha.2.3",
      "16.7.0-alpha.2.4",
      "16.7.0",
      "16.8.0-alpha.0",
      "16.8.1",
      "16.8.2",
      "16.8.3",
      "16.8.4",
      "16.8.5",
      "16.8.6"
    ],
    "time": {
      "created": "2018-11-21T10:47:51.342Z",
      "16.7.0-alpha.2": "2018-11-21T10:47:51.742Z",
      "modified": "2019-03-28T09:32:10.123Z",
      "16.7.0-alpha.2.1": "2018-11-21T21:35:44.318Z",
      "16.7.0-alpha.2.2": "2018-12-07T12:21:53.582Z",
      "16.7.0-alpha.2.3": "2018-12-17T06:55:29.788Z",
      "16.7.0-alpha.2.4": "2018-12-19T09:23:40.548Z",
      "16.7.0": "2018-12-20T09:22:04.981Z",
      "16.8.0-alpha.0": "2019-01-10T04:39:04.893Z",
      "16.8.1": "2019-02-07T00:17:32.764Z",
      "16.8.2": "2019-02-18T21:58:30.554Z",
      "16.8.3": "2019-02-25T21:15:23.701Z",
      "16.8.4": "2019-03-07T09:04:23.315Z",
      "16.8.5": "2019-03-25T11:19:27.329Z",
      "16.8.6": "2019-03-28T09:32:06.816Z"
    },
    "maintainers": [{ "name": "kashey", "email": "thekashey@gmail.com" }],
    "description": "The Hot version of React-DOM",
    "homepage": "https://github.com/hot-loader/react-dom#readme",
    "repository": {
      "type": "git",
      "url": "git+https://github.com/hot-loader/react-dom.git"
    },
    "bugs": { "url": "https://github.com/hot-loader/react-dom/issues" },
    "license": "MIT",
    "readmeFilename": "README.md",
    "keywords": ["HMR", "react", "hot-loader"],
    "version": "latest"
  }
}
*/
}
