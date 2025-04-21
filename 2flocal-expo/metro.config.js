// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add WatermelonDB transpilation
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json'];
config.transformer.babelTransformerPath = require.resolve('react-native-typescript-transformer');

// Add WatermelonDB to the list of modules to be transpiled
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Add WatermelonDB to the list of modules to be resolved
config.resolver.extraNodeModules = {
  '@nozbe/watermelondb': path.resolve(__dirname, 'node_modules/@nozbe/watermelondb'),
};

module.exports = config;