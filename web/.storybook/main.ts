import type { StorybookConfig } from "@storybook/nextjs";

/**
 * Storybook hosts the component catalogue. Stories live next to the components they cover
 * (e.g. `src/components/ui/button.stories.tsx`) so they're easy to find and stay in sync.
 *
 * Install once:
 *   npx storybook@latest init
 *   npm install -D @storybook/nextjs @storybook/addon-essentials @storybook/addon-a11y
 *
 * Then `npm run storybook` (script added in package.json).
 */
const config: StorybookConfig = {
  framework: { name: "@storybook/nextjs", options: {} },
  stories: ["../src/**/*.stories.@(ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  staticDirs: ["../public"],
  docs: { autodocs: "tag" },
  typescript: { check: false, reactDocgen: "react-docgen-typescript" },
};

export default config;
