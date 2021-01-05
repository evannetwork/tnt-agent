export function loadPlugin(name) {
  const loaded = require(`../plugins/${name}`);
  return loaded?.default || loaded?.plugin || loaded;
}

export async function iteratePlugins(plugins, callback) {
  for (let i = 0; i < plugins.length; i += 1) {
    const plugin = loadPlugin(plugins[i]);
    await callback(plugin);
  }
}
