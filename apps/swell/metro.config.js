const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');
const engineRoot = path.resolve(monorepoRoot, 'packages/engine');
const appNodeModules = path.resolve(projectRoot, 'node_modules');
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [engineRoot];

config.resolver.nodeModulesPaths = [appNodeModules, rootNodeModules];
config.resolver.unstable_enableSymlinks = true;
// Don't walk packages/engine/node_modules — that copy of Skia (2.11)
// is not the Expo Go native module (2.0-next.4).
config.resolver.disableHierarchicalLookup = true;

function resolveFromApp(name) {
  const fromApp = path.join(appNodeModules, name);
  if (fs.existsSync(fromApp)) return fromApp;
  const fromRoot = path.join(rootNodeModules, name);
  if (fs.existsSync(fromRoot)) return fromRoot;
  return fromApp;
}

config.resolver.extraNodeModules = new Proxy(
  { '@swell/engine': engineRoot },
  {
    get(target, name) {
      if (typeof name !== 'string') return undefined;
      if (Object.prototype.hasOwnProperty.call(target, name)) {
        return target[name];
      }
      return resolveFromApp(name);
    },
  }
);

module.exports = config;
