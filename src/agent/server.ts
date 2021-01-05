import express from 'express';
import bodyParser from 'body-parser';
import { Server } from 'http';
import { loadPlugin } from './plugin';
import TntHandler from './TntHandler';
import { ConfigInterface } from './interfaces';

export default function startServer(
  tntHandler: TntHandler,
  config: ConfigInterface,
): Server {
  tntHandler.log('info', 'start webhook server');

  const app = express();
  // apply express middleware
  app.use(bodyParser.json());

  config.plugins.forEach((pluginName) => {
    const { registerEndpoints } = loadPlugin(pluginName);
    if (registerEndpoints) {
      registerEndpoints(tntHandler, config, app);
    }
  });

  // eslint-disable-next-line no-underscore-dangle
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      tntHandler.log('info', `  ${config.serverUrl}${r.route.path}`);
    }
  });

  const server = app.listen(config.serverPort);
  tntHandler.log('info', `started webhook server: ${config.serverPort}`);
  return server;
};
