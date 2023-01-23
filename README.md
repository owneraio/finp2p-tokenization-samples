## FinP2P tokenization samples
NodeJS CLI tool that provides ability to run quick asset creation and get cap table operation

### Installation
Clone this repo then simply run the `yarn install` or `npm install` command at the root of the repo

### Configuration 
The `config` object has few sections

| Section 	| Description                                         	|
|---------	|-----------------------------------------------------	|
| sdk     	| Provides required data to connect to FinP2P network 	|
| escrow  	| The id of target escrow node                        	|
| asset   	| Data required to create an asset                    	|

This configuration should be set in the `config.ts` file at the root of the repo.

### Usage 
Run the command `yarn start` or `npm run start` and the CLI will start

#### Create asset
Selecting this option will use the provided data from `config` in order to create an asset with an opened primary sale.  
The config allows you to set the data about the asset itself (`assetTicker`, `assetName`, ...) and 
the primary sale (`primarySaleQuantity`, `primarySaleUnitValue`).  
Some data about the asset are optional and won't block the asset creation if no value is provided
(`assetOptionalData`, `shareWith`) 

#### Get cap table
Selecting this option will let you select an existing asset and will provide its capitalization table data. 
