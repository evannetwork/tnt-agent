import axios from 'axios';
import startTntAgent from '../../agent/index';
import { ConfigInterface } from '../../agent/interfaces';
import testConfig from '../../test.config';

const did = 'did:evan:testcore:0xed8c22f3758507a5741a484239197fc0b731ccc8#key-1';
const privateKey = '0x672cde94f516892ca556e2fd1171cbc1b8b18774824b03a50b6a78e5e45297f9';
const signerConfig = {
  tntApi: testConfig.tntApi,
  tntAuthApi: 'http://localhost:1337',
  serverUrl: 'http://localhost:1337',
  serverPort: 1337,
  context: testConfig.user1,
  plugins: [
    'signer/signer',
  ],
  publicPrivateKeys: {
    '0xD14d4858a4d67e656373d72E285165cC5Ba3d56D': privateKey,
  },
} as ConfigInterface;

describe('external signing', () => {
  beforeAll(() => {
    global.console = require('console');
  });

  it('handle nce requests and reacts on ', async () => {
    // start lei server and login with lei user
    await startTntAgent(signerConfig);
    const { data } = await axios.post(`${signerConfig.serverUrl}/sign`, {
      did,
      message: 'AWESOME',
    });

    expect(data.messageHash).toBe('0xe8fb3dfd42ae078f169128f8fe522804b7db988631d60d7fa25e59811be7e410');
    expect(data.signature).toBe('0x5d7d30c21dee4d860fa244dff975567934264f2ddb4351a18d6585f3e609a212286fb4f1d50af7ac9d0e62897eef173c64eb4455963495a5c41583798aa4fddd1b');
    expect(data.signerAddress).toBe('0xD14d4858a4d67e656373d72E285165cC5Ba3d56D');
  });
});
