import chalk from 'chalk';
import inquirer from 'inquirer';
import createAsset from './createAsset';
import getAssets from './getAssets';
import getCapTable from './getCapTable';

const choices = [
  'Create new issuer and shared asset with primary sale',
  'Get cap table for an asset',
];

(async () => {
  console.info(chalk.bold(`Welcome to FinP2P tokenization samples !`));
  try {
    const mainAction = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: `Please choose an action:`,
      choices,
      default: 0,
    }]);

    if (mainAction.action === choices[ 0 ]) {
      await createAsset();
    }

    if (mainAction.action === choices[ 1 ]) {
      const assets = await getAssets();
      if (assets.length > 0) {
        const assetSelection = await inquirer.prompt<{selection: string}>([{
          type: 'list',
          name: 'selection',
          message: 'Choose asset:',
          choices: assets,
        }]);
        const assetId = assetSelection.selection.split('-->')[0].trim();
        const capTable = await getCapTable(assetId);
        console.info(chalk.greenBright.bold.underline(`Cap table:`));
        console.info(chalk.bold(JSON.stringify(capTable, null, 2)));
      } else {
        console.error(chalk.redBright(`No asset to display. Try creating an asset first.`));
      }
    }
  } catch (e) {
    console.error(chalk.redBright(`Oops, some error occurred:`));
    console.error(e);
  }
})();
