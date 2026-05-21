/**
 * Iter 150 — mobile Jest configuration.
 *
 * Uses Expo's jest-expo preset (handles Metro transforms, registers the
 * standard Expo module mocks). Picks up *.test.{ts,tsx} files anywhere
 * in src/ or app/.
 *
 * Coverage is reported text + html into coverage/ but turned off by
 * default to keep `npm test` snappy — run `npm run test:coverage` when
 * you want it.
 */
module.exports = {
  preset: "jest-expo",
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/app/**/*.test.{ts,tsx}",
  ],
  transformIgnorePatterns: [
    // Default jest-expo ignores node_modules but DOES transform
    // expo-* / react-native / @react-navigation modules. We append a
    // few that ship ESM without `module` field.
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-masked-view/.*|nativewind))",
  ],
  collectCoverageFrom: [
    "src/components/ui/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
};
