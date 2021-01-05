import { ecsign, toRpcSig } from 'ethereumjs-util';
import { EvanDIDResolver, EvanDIDDocument } from "@evan.network/did-resolver";
import { Express, Request, Response } from 'express';
import Web3 from 'web3';
import { ConfigInterface, TntPlugin } from '../../agent/interfaces';
import TntHandler from '../../agent/TntHandler';

const web3 = new Web3();

interface PublicKey {
  id: string;
  type: string;
  controller: string;
  ethereumAddress: string;
}

interface Proof {
  type: string;
  created: Date;
  proofPurpose: string;
  verificationMethod: string;
  jws: string;
}

interface DidDocInterface {
  id: string;
  publicKey: PublicKey[];
  authentication: string[];
  created: Date;
  updated: Date;
  proof: Proof;
}

/**
 * Sign a specific message with a given private key.
 *
 * @param privateKey private key to sign with
 * @param message stringified object to sign
 */
function signMessageRequest(privateKey: string, message: string) {
  let messageHash;
  if (!message) {
    // if no message provided, use timestamp
    let dateMessage = Date.now().toString(16);
    // check to see if message length is odd
    // if odd then concatenate 0x0 else 0x
    if (dateMessage.length % 2 === 0) {
      dateMessage = `0x${dateMessage}`;
    } else {
      dateMessage = `0x0${dateMessage}`;
    }
    messageHash = web3.eth.accounts.hashMessage(dateMessage);
  } else if (!message.startsWith('0x')) {
    // if message is a regular string, hash it
    messageHash = web3.eth.accounts.hashMessage(message);
  } else {
    // if message is already a hash, use it as is
    messageHash = message;
  }

  // convert messageHash to buffer for signing
  const digestNew = Buffer.from(web3.utils.hexToBytes(messageHash));

  // convert key to buffer for signing
  const keyBuffer = Buffer.from(privateKey, 'hex');
  const signedMessageObject = ecsign(digestNew, keyBuffer);

  // ecsign only returns the r,s,v parameters therefore recover the signature from the parameter
  const signature = toRpcSig(signedMessageObject.v, signedMessageObject.r, signedMessageObject.s);

  // convert r,s,v parameters to hex strings because web3 recovery expects hex strings
  const r = (signedMessageObject.r).toString('hex');
  const s = (signedMessageObject.s).toString('hex');
  const v = (signedMessageObject.v).toString(16);

  let recoveredPublicKey;
  // web3 recover function does not work properly when entire signature string is passed,
  // therefore manually passing r,s,v parameters
  recoveredPublicKey = web3.eth.accounts.recover({
    messageHash: `0x${digestNew.toString('hex')}`,
    v: `0x${v}`,
    r: `0x${r}`,
    s: `0x${s}`
  });

  return {
    messageHash,
    signature,
    signerAddress: recoveredPublicKey,
  };
}

async function getDid(did: string): Promise<DidDocInterface> {
  const resolverTestcore = new EvanDIDResolver('https://testcore.evan.network/did');
  const resolverCore = new EvanDIDResolver('https://core.evan.network/did');

  let didDocument: EvanDIDDocument;
  if (did.startsWith('did:evan:testcore:')) {
    didDocument = await resolverTestcore.resolveDid(did);
  } else {
    didDocument = await resolverCore.resolveDid(did);
  }
  return didDocument as unknown as DidDocInterface;
}

function registerEndpoints(tntHandler: TntHandler, config: ConfigInterface, server: Express) {
  server.post('/sign', async (req: Request, res: Response) => {
    const { did, message } = req?.body || {};

    if (!did) {
      return res.status(400).send({
        message: 'did is a required parameter',
     });
    }

    if (!message) {
      return res.status(400).send({
        message: 'message is a required parameter',
     });
    }

    // fetch the did document
    const didDoc: DidDocInterface = await getDid(did) as unknown as DidDocInterface;
    if (!didDoc.authentication.includes(did)) {
      throw new Error(`did is not authorized to sign the message`)
    }
    // find the ethereum address from publicKey
    let ethereumAddress = (didDoc.publicKey.find(
      (address) => (address.id === did),
    ) as unknown as { ethereumAddress: string }).ethereumAddress;
    ethereumAddress = web3.utils.toChecksumAddress(ethereumAddress);

    if (!config.publicPrivateKeys && !config.publicPrivateKeys[ethereumAddress]) {
      throw new Error(`address is not configured for signing in server: ${ethereumAddress}`);
    }

    try {
      let privateKey = config.publicPrivateKeys[ethereumAddress];
      if (privateKey.startsWith('0x')) {
        privateKey = privateKey.substring(2);
      }
      const result = signMessageRequest(privateKey, message);
      res.status(200).send(result);
    } catch (ex) {
      tntHandler.log('error', ex);
      res.status(400).send({
        message: `Error while signing: ${ex.message}`,
      });
    }
  });
}

const plugin: TntPlugin = {
  registerEndpoints,
};

export default plugin;