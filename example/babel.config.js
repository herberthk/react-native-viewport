// const path = require('path');
// const { getConfig } = require('react-native-builder-bob/babel-config');
// const pkg = require('../package.json');

// const root = path.resolve(__dirname, '..');

// module.exports = function (api) {
//   api.cache(true);

//   return getConfig(
//     {
//       presets: ['babel-preset-expo'],
//     },
//     { root, pkg }
//   );
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Required for Reanimated v2
    ],
  };
};
