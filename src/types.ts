import { AssetDenomination } from '@owneraio/finp2p-sdk-js';

export interface Configuration {
  // escrow config
  escrow: {
    orgId: string;
  };

  // sdk config
  sdk : {
    orgId: string;
    owneraAPIAddress: string;
    owneraRASAddress: string;
    custodyAdapterBaseURL: string;
    apiKey: string;
    apiSecret: string;
  }

  // asset to create - config
  asset: {
    // issuer data
    issuerName: string;
    issuerEmail: string;
    // asset data
    assetTicker: string;
    assetType: string;
    assetDenominationType: AssetDenomination['type'],
    assetDenominationCode: AssetDenomination['code'],
    assetName: string;
    assetDescription: string;
    // optional asset data
    assetOptionalData: Record<string, string>;
    // primary sale data
    primarySaleQuantity: number;
    primarySaleUnitValue: number;
    // asset sharing data
    shareWith: string[];
  }
}
