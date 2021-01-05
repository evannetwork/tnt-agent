import { ConfigInterface } from './agent/interfaces';

export default {
  tntApi: process.env.TNT_API_URL || 'http://localhost:7070',
  tntAuthApi: process.env.TNT_API_URL || 'http://localhost:7070',
  serverUrl: process.env.TNT_API_URL || 'http://localhost:1337',
  serverPort: 1337,
  plugins: [
    'signer/signer',
  ],
  webhook: { headers: null },
  context: {
    apiLogin: {
      'tnt-subscription-key': '6e09e4d0245341ddb65a9f1bd31097ff',
      accountUuid: '342a4fdb-97af-411e-9e47-7baee4aa5af1',
      principalUuid: 'ae61bb26-9d77-47bd-b22d-c0997a40de71',
    },
    emailLogin: {
      email: 'test.trust-trace@test.de',
      password: 'test.trust-trace@test.de',
    },
    identity: '',
  },
  publicPrivateKeys: {
    '0xF4a6eA9978A30a0c66c286FD9e361981dA53277c': '0x674f62416c557e9748655147e70deb160ec43353317a9f4100d4fe299ac1e4e8',
  },
} as ConfigInterface;
