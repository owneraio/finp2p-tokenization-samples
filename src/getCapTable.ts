import { getSdk } from './utils';

const getCapTable = async (assetId: string) => {
  const sdk = getSdk();

  if (!sdk) {
    return {} as Record<string, string>;
  }

  const asset = sdk.getAsset({ assetId });
  return await asset.getCapTable();
};

export default getCapTable;
