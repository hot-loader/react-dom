react-dom - hot-loader edition
=====
This is normal `react-dom` with some patches applied to be more 
[React-Hot-Loader](https://github.com/gaearon/react-hot-loader) friendly.

Use it to obtain more 🔥 dev experience.

# Differences from react
There are just 4 changed lines, see `patch.js` for details

# Using this module

## Install
```text
yarn add @hot-loader/react-dom@YOUR_REACT_VERSION
```
> Right now only 16.7.0-alpha.2 version is available

## Rewire
To use this version of React-dom you have to rewire your application

### Webpack
just configure your webpack to alias this package, instead of a real react-dom.
See https://webpack.js.org/configuration/resolve/#resolve-alias
```js
// webpack.conf
...
resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom'
    }
}
...
```
You may set configuration to only use react-🔥-dom only in dev mode.
### Parcel
Use `alias` field in `package.json` to rewire your project. This will affect dev and production modes.
See https://github.com/parcel-bundler/parcel/pull/850
```js
{
  "alias": {
    "react-dom": "@hot-loader/react-dom"
  }
}
```

### (Yarn) Any other system
For any other build system, which may not support aliasing - use yarn name resolution.
See https://twitter.com/sebmck/status/873958247304232961?lang=en for details.
```text
yarn add react-dom@npm:@hot-loader/react-dom
```

# Using webpack-loader
React-hot-loader's webpack-loader could land necessary patches on
build time. If you can use it instead of this package, if you can.

# Production ready
production bundle, exported by this package is __identical to the original
react-dom.production.min.js__. It is safe to keep rewiring in production.


# License
React is MIT licensed. This library is still react