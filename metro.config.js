// Metro is the bundler that packs the app for Android, iOS and web.
// withNativeWind() compiles our Tailwind classes from global.css.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
