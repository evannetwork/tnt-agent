import { Express } from 'express';

import TntHandler from './TntHandler';

export interface ApiLogin {
  'tnt-subscription-key': string,
  accountUuid: string,
  principalUuid: string,
}

export interface EmailLogin {
  email: string,
  password: string,
}

export interface TntContext {
  emailLogin?: EmailLogin,
  identity?: string,
  apiLogin?: ApiLogin,
}

export interface ConfigInterface {
  // tnt base api server to request
  tntApi: string,
  // tnt auth api server to request
  tntAuthApi: string,
  // where is the agent running?
  serverUrl: string,
  // port to start the server at
  serverPort: number,
  // plugins to load
  plugins: string[],
  // user context to run with against TRUST&TRACE API
  context: TntContext
  // basic webhook config
  webhook?: {
    headers: { [key: string]: string},
  },
  // signing plugin configuration: publicKey: privateKey pair set
  publicPrivateKeys?: Record<string, string>,
  // allow any plugin related configuration
  [key: string]: any,
}

export interface SchemaDefinitionInterface {
  description: string;
  identityUuid?: string;
  name: string;
  order: string[];
  properties: {
    [key: string]: {
      type: string,
    },
  };
  requiredInFrontend: string[];
  requiredProperties: string[];
}

export interface WebhookInterface {
  // headers that should be sent with the HTTP request
  headers?: { [key: string]: string };

  // url that should be requested
  url: string;

  // get, post, put, delete, ...
  method: string;

  // regex that matches the didcomm message type or one decorator key
  match: string;
}

export interface TntPlugin {
  onStart?: (tntHandler: TntHandler, config: ConfigInterface) => Promise<void>,
  registerEndpoints?: (tntHandler: TntHandler, config: ConfigInterface, server: Express) => void,
  schemas?: SchemaDefinitionInterface[],
  webhooks?: WebhookInterface[]|((config: ConfigInterface) => WebhookInterface[]),
}