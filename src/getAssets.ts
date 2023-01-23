import { getSdk } from './utils';

const getAssets = async () => {
  const sdk = getSdk();

  if (!sdk) {
    return [];
  }

  const assets = await sdk.owneraAPI.query.getAssets({});

  return assets.map(a => `${a.id} --> ${a.name}`);
};

export default getAssets;
