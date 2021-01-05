import { ConfigInterface } from './interfaces';
import { loadPlugin } from './plugin';
import TntHandler from './TntHandler';

export default async function ensureSettings(tntHandler: TntHandler, config: ConfigInterface) {
  // load all settings from all plugins
  let combinedSettings = [];
  config.plugins.forEach((pluginName) => {
    // only register configured webhooks
    let { webhooks } = loadPlugin(pluginName);
    if (webhooks) {
      webhooks = typeof webhooks === 'function' ? webhooks(config) : webhooks;
      combinedSettings = [...combinedSettings, ...webhooks];
    }
  });

  if (combinedSettings.length === 0) {
    return;
  }

  tntHandler.log('info', 'ensure didcomm webhook');
  combinedSettings.forEach(({ match, url }) => tntHandler.log('info', `  ${match} => ${url}`));

  // update latest configurations
  await tntHandler.request('post', 'settings/DIDCOMM_WEBHOOK', {
    principalUuid: tntHandler.principalUuid,
    setting: combinedSettings,
    status: 'ACTIVE',
  });
};
