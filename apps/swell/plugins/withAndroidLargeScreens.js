const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Android 16 ignores portrait locks on large screens. Drop the restriction
 * from MainActivity so foldables and tablets can rotate, and keep the
 * activity resizeable.
 */
function withAndroidLargeScreens(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;

    application.$['android:resizeableActivity'] = 'true';

    for (const activity of application.activity ?? []) {
      const name = activity.$?.['android:name'] ?? '';
      if (name === '.MainActivity' || name.endsWith('.MainActivity')) {
        delete activity.$['android:screenOrientation'];
      }
    }

    return config;
  });
}

module.exports = withAndroidLargeScreens;
