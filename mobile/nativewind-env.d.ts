/// <reference types="nativewind/types" />

// NativeWind v4 / react-native-css-interop dropped the ambient `*.css`
// side-effect module declaration from its published types, so the
// `import "../global.css"` in app/_layout.tsx no longer type-checks.
// Re-declare it here (harmless no-op module) to keep tsc green.
declare module "*.css" {}
