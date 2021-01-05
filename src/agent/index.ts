import { Server } from 'http';
import baseConfig from '../config';
import { ConfigInterface } from './interfaces';
import onStart from './onStart';
import ensureTemplates from './schema.helper';
import startServer from './server';
import ensureSettings from './settings.helper';
import TntHandler from './TntHandler';

async function start(
  config: ConfigInterface = baseConfig,
): Promise<{ server: Server, tntHandler: TntHandler }> {
  try {
    const handler = await TntHandler.init(config.context);

    await ensureSettings(handler, config);
    await ensureTemplates(handler, config);
    await onStart(handler, config);

    return {
      server: startServer(handler, config),
      tntHandler: handler,
    };
  } catch (ex) {
    if (ex.isAxiosError && ex.response) {
      // eslint-disable-next-line no-console
      console.log([
        `[ERROR][${ex.response.status}] ${ex.config.url}`,
        JSON.stringify(ex.response.data),
      ].join(', '));
    }

    throw ex;
  }
}

if (process.env.IS_TEST !== 'true') {
  start();
}

export default start;
