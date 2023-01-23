import { Configuration } from './src/types';

const config: Configuration = {
  // escrow config
  escrow: {
    orgId: '',
  },

  // sdk config
  sdk: {
    orgId: '',
    owneraAPIAddress: '',
    owneraRASAddress: '',
    custodyAdapterBaseURL: '',
    apiKey: '',
    apiSecret: '',
  },

  // asset to create - config
  asset: {
    // issuer data
    issuerName: '',
    issuerEmail: '',
    // asset data
    assetTicker: '',
    assetType: '',
    assetDenominationType: 'fiat',
    assetDenominationCode: 'USD',
    assetName: '',
    assetDescription: '',
    // optional asset data
    assetOptionalData: {
      // propertyName: 'value',
    },
    // primary sale data
    primarySaleQuantity: 15000,
    primarySaleUnitValue: 10,
    // asset sharing data
    shareWith: [],
  },
};

export default config;
