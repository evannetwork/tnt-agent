# TRUST&TRACE agent

This project includes several basic structures for handling the TRUST&TRACE API within the context
of a principal easier.

- configuration for endpoints, users and webhooks
- easy login and request handling
- auto ensuring webhook settings
- auto ensuring credential templates and credential definitions
- plugin handling

**IMPORTANT**: This source code **NOT** actively supported by TRUST&TRACE. It's just a best practice how a nodejs usage of the TRUST&TRACE API could look like.

## Install and start

```sh
yarn
yarn start
```

## Configuration

To use the agent, you need a registered account on TRUST&TRACE. Please register first and use your email + password or create your own login token, to be able to use the agent.

The configuration is handled within the `./src/config.ts` file. For detailed descriptions have a
look at `./src/lib/interfaces.ts`.

```typescript
import { ConfigInterface } from './agent/interfaces';

export default {
  tntApi: process.env.TNT_API_URL || 'http://localhost:7070',
  serverUrl: process.env.TNT_API_URL || 'http://localhost:1337',
  serverPort: 1337,
  plugins: [
    'lei/lei',
    'signer/signer',
  ],
  webhook: { headers: null },
  context: {
    // apiLogin: {
    //   'ocp-apim-subscription-id': 'ce81e3cb-817f-4916-aa69-655e29e457fc',
    //   'ocp-apim-subscription-key': 'da24449febd64788b6ce34412d289345',
    //   accountUuid: '342a4fdb-97af-411e-9e47-7baee4aa5af1',
    //   principalUuid: 'ae61bb26-9d77-47bd-b22d-c0997a40de71',
    // },
    emailLogin: {
      email: 'test.trust-trace@test.de',
      password: 'test.trust-trace@test.de',
    },
    identity: '',
  },
  publicPrivateKeys: {
    '0xF4a6eA9978A30a0c66c286FD9e361981dA53277c': '0x674f62416c557e9748655147e70deb160ec43353317a9f4100d4fe299ac1e4e8',
  },
  lei: {
    api: 'https://PLACE_LEI_API_HERE',
    authToken: '',
  },
} as ConfigInterface;


```

## Plugins

Plugins are just start scripts that are included within the basic structure to be able to work in
different contexts a bit easier. Configure the path to your plugin typescript file within the
configuration.

Plugin can return the following structure.

```ts
import config from '../../config';
import { TntPlugin } from '../../lib/interfaces';
import SampleSchema from './sample.schema.json'

const schemas = [SampleSchema];

const webhooks = [
  {
    url: `${config.webhook.url}/new-credential`,
    method: 'POST',
    // listen for new incoming credentials
    match: 'credentials~attach',
  },
];

async function onStart(tntHandler) {
  tntHandler.log('sample: on start')
}

function registerEndpoints(tntHandler, server) {
  server.post('/new-credential', (req, res) => {
    console.log('sample: new credential');
    console.log({ req, res });
  });
}

const plugin: TntPlugin = {
  onStart,
  registerEndpoints,
  schemas,
  webhooks,
}

export default plugin;

```

## Running tests

To run the tests, just register two accounts on TRUST&TRACE and configure this users within the `./src/test.config.ts` file.
