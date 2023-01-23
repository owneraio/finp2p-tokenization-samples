import chalk from 'chalk';
import config from '../config';
import { getSdk, signingMethod } from './utils';
import { AssetDenomination, FiatAsset, SettlementAssetTerm } from '@owneraio/finp2p-sdk-js';
import path from 'path';
import { promisify } from 'util';
import * as fs from 'fs';


const now = Date.now();
const future = now + 31536000000;

const createAsset = async () => {
  const sdk = getSdk();
  if (!sdk) {
    return;
  }

  // check config data
  const missing: string[] = Object.entries(config.asset)
    .map((entry: any) => !entry[1] && entry[0])
    .filter(m => !!m);
  if (missing.length > 0) {
    console.error(chalk.redBright(`
  Asset creation aborted because some values are missing in config:
  ${JSON.stringify(missing)}
  `));
    return;
  }

  // check if issuer already exists for the organization
  let issuerId = '';
  let issuerPk = '';
  const allUsers = await sdk.owneraAPI.query.getUsers({});
  const existingIssuer = allUsers.find(u => u.email === config.asset.issuerEmail && u.userId.includes(config.sdk.orgId));
  if (!!existingIssuer) {
    issuerId = existingIssuer.userId;
    issuerPk = existingIssuer.publicKey;
    console.info(chalk.blueBright(`Issuer already existing: ${config.asset.issuerName}. Skipping creation.`));
  }

  // create issuer
  if (!existingIssuer) {
    console.info(chalk.blueBright(`Creating issuer: ${config.asset.issuerName}`));
    const uniqueIdentifier = Date.now();
    const issuerAccount = await sdk.owneraAPI.custodyAdapter!.createAccount({
      uniqueIdentifier,
      name: uniqueIdentifier.toString() + ' custody account',
    });
    const issuer = await sdk.createUser({
      withSignatureProvider: {
        publicKey: issuerAccount.publicKey,
        signingMethod: signingMethod({custody: sdk.owneraAPI.custodyAdapter!, accountId: issuerAccount.id}),
      },
    });
    await issuer.share([config.escrow.orgId]);
    issuerId = issuer.id;
    issuerPk = issuerAccount.publicKey;
    console.info(chalk.blueBright(`Issuer created with id ${issuer.id}`));

    console.info(chalk.blueBright(`Adding issuer certificate`));
    const issuerCertificateRequest = sdk.utils.createOwnerInfoRequest({
      email: config.asset.issuerEmail,
      name: config.asset.issuerName,
      expirationDate: future,
      issuanceDate: now,
      type: 'issuer',
    });
    const issuerInfo = await issuer.createCertificate(issuerCertificateRequest);
    console.info(chalk.blueBright(`Certificate created with id ${issuerInfo.id}`));
  }

  // create asset
  console.info(chalk.blueBright(`Creating asset: ${config.asset.assetName}`));
  const asset = await sdk.createAsset({
    issuerId,
    name: config.asset.assetTicker,
    type: config.asset.assetType,
    verifiers: [],
    denomination: {
      type: config.asset.assetDenominationType,
      code: config.asset.assetDenominationCode,
    } as AssetDenomination,
  });
  console.info(chalk.blueBright(`Asset created with id ${asset.id}`));

  // add kya
  console.info(chalk.blueBright(`Adding asset KYA`));
  const kyaRequest = sdk.utils.createKyaRequest({
    ...config.asset.assetOptionalData,
    description: config.asset.assetDescription,
    expirationDate: future,
    issuanceDate: now,
    name: config.asset.assetName,
  });
  const kya = await asset.createCertificate(kyaRequest);
  console.info(chalk.blueBright(`KYA created with id ${kya.id}`));

  const pathToDocs = path.resolve(path.join(__dirname, 'kyaDocs'));
  const files = (await promisify(fs.readdir)(pathToDocs)).filter(f => f !== '.gitkeep');
  if (files.length > 0) {
    const stream = await Promise.all(files.map(f => fs.createReadStream(path.resolve(pathToDocs, f))));
    const docResponse = await kya.addDocuments(stream);
    console.info(chalk.blueBright(`Added ${files.length} document${files.length > 1 && 's'} to KYA:
${chalk.italic.whiteBright(JSON.stringify(docResponse.refs, null, 2))} 
    `));
  }

  // share asset
  console.info(chalk.blueBright(`Sharing asset ${config.asset.assetName} with orgs: ${JSON.stringify(config.asset.shareWith)}`));
  await asset.share(config.asset.shareWith);
  console.info(chalk.blueBright(`Shared asset`));

  // create primary sale
  console.info(chalk.blueBright(`Creating primary sale for asset: ${config.asset.assetName}`));
  const primarySale = await asset.createPrimarySale({
    start: now,
    end: future,
    amount: config.asset.primarySaleQuantity.toString(),
    unitValue: config.asset.primarySaleUnitValue.toString(),
    settlementAssetTerm: {
      type: config.asset.assetDenominationType,
      code: config.asset.assetDenominationCode,
    } as SettlementAssetTerm,
    settlementDestinationAccounts: [{
      asset: {
        type: config.asset.assetDenominationType,
        code: config.asset.assetDenominationCode,
      } as FiatAsset,
      account: {
        type: 'finId',
        finId: issuerPk,
        orgId: config.escrow.orgId,
      },
    }],
  });
  console.info(chalk.blueBright(`Created primary sale with id: ${primarySale.id}`));
};

export default createAsset;
