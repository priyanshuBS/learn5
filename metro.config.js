// Metro is the bundler that packs the app for Android, iOS and web.
// withNativeWind() compiles our Tailwind classes from global.css.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Folders Metro never needs to bundle. On Windows, Metro watches every folder
// one by one (there is no native watcher), and node_modules has ~15,000 of
// them; that can run out of file handles ("EMFILE: too many open files") when
// many files change at once. These are test, lint and type-check tools plus
// build output, so skipping them roughly halves what Metro watches.
const SKIP = [
  /[\\/]node_modules[\\/](jest[^\\/]*|@jest|expect|@types|typescript|eslint[^\\/]*|@eslint|@typescript-eslint|prettier|@testing-library|jsdom|esbuild|@esbuild|tsx)[\\/].*/,
  new RegExp(`^${__dirname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\\\/]dist[\\\\/].*`),
];
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...SKIP,
];

module.exports = withNativeWind(config, { input: './global.css' });
