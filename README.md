# ITX_RelayTransaction_Demo

ITX_RelayTransaction_Demo is a Demo for Infura ITX which is a simplified way to send Ethereum transactions. ITX handles all edge cases for transaction delivery and takes care of getting transactions mined while removing the need for developers to deal with the complexities around gas management.

PS: ITX supports only legacy transactions!
## Getting started
- Clone this repository
```sh
git clone https://github.com/integrations-Polygon/ITX_RelayTransaction_Demo.git
```
- Navigate to `ITX_RelayTransaction_Demo`
```sh
cd ITX_RelayTransaction_Demo
```
- Install dependencies
```sh
npm install
```
- Create `.env` file
```sh
cp .example.env .env
```
- Configure environment variables in `.env`
```
NETWORK = your_network_name // matic for polygon mainnet, maticmum for mumbai testnet
PROJECT_ID = your_provider_project_id
RPC_PROVIDER = your_provider_rpc_url
SIGNER_PRIVATE_KEY = your_private_key
PUBLIC_KEY = your_public_key
EXPLORER_API_KEY = your_explorer_api_key
```

## Usage
Start the Main script by running this command
```javascript
npx hardhat run ./scripts/startTransaction.js

```
After that you will be presented with 4 options to choose from:

### Option 1: Deposit MATIC tokens to itx gas tank
First, enter the amount of Matic to be transfered to the ITX gas tank.

Then type "Y" to confirm that you want to proceed with the transfer or type "N" to exit.

The funds will be transfered to the ITX gas tank at this address :
```javascript
0x015C7C7A7D65bbdb117C573007219107BD7486f9   

```

### Option 2: Deploy your smart contract
First, you will have to enter the contract artifact generated by hardhat, here's an example:  
```javascript
.\artifacts\contracts\Demo.sol\Demo.json    

```
If the contract has an arguments in its constructor, you wil be asked to enter them.  
  
After that, the script will generate an encoded relay transaction hash, signs it and sends it to the network
Then a receipt of the Transaction will be saved in  a JSON file and in Redis Database.

### Option 3: Call a function of deployed smart contract
First, you will have to enter the address of the already deployed and verified smart contract, here's an example:  
```javascript
0xCCFD7490d9F4a44d3664CDCF5E2721863C507e81   

```
Then you will be asked to enter the name of the function you want to call, for example:  
```javascript
myFunction   

```
After that you will have to enter the arguments of the function.

Finally, the script will fetch the ABI from the blockchain,
initialize all the interfaces.
Then an encoded relay transaction hash will be generated, signed and sent to the network which will result in a receipt that wil be stored
in a JSON file and in redis Database.

### Option 4: Check your ITX gas tank balance
Choosing this option will show the available balance in the ITX gas tank which is used to relay transactions.

The fees of relaying transactions are deducted from the balance of the gas tank.
