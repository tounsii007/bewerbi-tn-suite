const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// The `@shared/*` tsconfig path alias points at ../shared/lib (cross-platform
// helpers like password-strength). Metro needs to watch that folder, and to
// resolve `react`/`react-native` from this project even when imported code
// lives outside the project root.
const sharedLib = path.resolve(__dirname, "../shared/lib");
config.watchFolders = [...(config.watchFolders ?? []), sharedLib];
config.resolver.nodeModulesPaths = [
  ...(config.resolver.nodeModulesPaths ?? []),
  path.resolve(__dirname, "node_modules"),
];

module.exports = withNativeWind(config, { input: "./global.css" });
