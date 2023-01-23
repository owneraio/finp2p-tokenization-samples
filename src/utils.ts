import chalk from 'chalk';
import { CustodyAdapter, Sdk } from '@owneraio/finp2p-sdk-js';
import config from '../config';

let sdk: Sdk;

export const getSdk = () => {
  if (!!sdk) {
    return sdk;
  }

  try {
    sdk = new Sdk({
      orgId: config.sdk.orgId,
      owneraAPIAddress: config.sdk.owneraAPIAddress,
      owneraRASAddress: config.sdk.owneraRASAddress,
      custodyAdapterBaseURL: config.sdk.custodyAdapterBaseURL,
      authConfig: {
        apiKey: config.sdk.apiKey,
        secret: {
          type: 2,
          raw: config.sdk.apiSecret,
        },
      },
    });
    return sdk;
  } catch (e) {
    console.error(e)
    console.error(chalk.redBright(`
Error while instantiating the FinP2P sdk js. Please check the configuration you provided.
    `));
  }
};

export const signingMethod = (r: { custody: CustodyAdapter, accountId: string }) => async (hash: string) => {
  let attempt = 0;
  let signatureResponse = await (r.custody.createSignature({ id: r.accountId, hash }));
  const signatureId = signatureResponse.id;
  const doRetry = !['FAILED', 'COMPLETED'].includes(signatureResponse.status);
  while (doRetry && attempt < 10) {
    signatureResponse = await r.custody.getSignature({ signatureId });
    attempt = attempt + 1;
  }

  if (doRetry && attempt === 10) {
    throw {
      code: 408,
      name: 'SignatureError',
      message: 'Timeout - unable to get signature',
      data: signatureResponse,
    };
  }

  if (signatureResponse.status === 'FAILED') {
    throw {
      code: 500,
      name: 'SignatureError',
      message: 'Failure - unable to get signature',
      data: signatureResponse,
    };
  }

  return Promise.resolve(signatureResponse.signature);
};
