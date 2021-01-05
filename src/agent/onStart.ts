import { ConfigInterface } from './interfaces';
import { iteratePlugins } from './plugin';
import TntHandler from './TntHandler';

export default async function (tntHandler: TntHandler, config: ConfigInterface) {
  await iteratePlugins(config.plugins, async ({ onStart }) => {
    if (onStart) {
      await onStart(tntHandler, config);
    }
  });
};
