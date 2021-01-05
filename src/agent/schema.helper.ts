import * as Throttle from 'promise-parallel-throttle';
import { ConfigInterface } from './interfaces';
import { iteratePlugins } from './plugin';
import TntHandler from './TntHandler';

export default async function ensureSchemasAndCredentials(
  tntHandler: TntHandler,
  config: ConfigInterface,
) {
  tntHandler.log('info', 'ensure schemas and credential definitions');

  await iteratePlugins(config.plugins, async ({ schemas }) => {
    await Throttle.all((schemas || []).map((schemaDef) => async () => {
      tntHandler.log('info', `  checkup schema => ${schemaDef.name}`);

      let schema = await tntHandler.request('get', `schema/${schemaDef.name}`);
      if (!schema) {
        schema = await tntHandler.request('post', `schema`, {
          ...schemaDef,
          identityUuid: tntHandler.identityUuid,
        });
      }

      let credentialDefinition = await tntHandler.request(
        'get',
        `credential-definition/${schema.name}`,
      );
      if (!credentialDefinition) {
        credentialDefinition = await tntHandler.request('post', `credential-definition`, {
          schemaUuid: schema.uuid,
          identityUuid: tntHandler.identityUuid,
        });
      }
    }), { maxInProgress: 10, failFast: true });
  });
}