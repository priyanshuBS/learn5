// Babel turns our modern TypeScript/JSX into code the phone and browser can run.
// The two NativeWind entries let us write Tailwind classes in `className`.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
