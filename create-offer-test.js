'use strict';

const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const gateway = new Gateway();
async function main() {
  try {
    
    const uIdentity = 'admin';
    const channel = 'mychannel';
    const offerId = 'offer~check5ef66388e0b687248c3f9e6c~issuer-test1~badge-test1~dt1593205640';
    // Parse the connection profile. This would be the path to the file downloaded
    // from the IBM Blockchain Platform operational console.
    const ccpPath = path.resolve(__dirname, 'connection.yaml');
    const ccp = yaml.load(fs.readFileSync(ccpPath, 'utf8'));

    // Configure a wallet. This wallet must already be primed with an identity that
    // the application can use to interact with the peer node.
    
    const walletPath = path.resolve(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log('Wallet===>', wallet);
    await gateway.connect(ccp, { wallet: wallet, identity: uIdentity, discovery: { enabled: true, asLocalhost: false } });
    console.log('Gateway===>', gateway);
    // Get the network channel that the smart contract is deployed to.
    const network = await gateway.getNetwork(channel);
    console.log('Network===>', network);
    // Get the smart contract from the network channel.
    const contract = network.getContract('rmoffer_7');
    console.log('Contract===>', contract);

    let test = await contract.submitTransaction('CreateReliablyMeOffer', 'committer2', 'issuer2', 'badge2', 'createddate2', 'chksum2', 'status2');
    console.log('Transaction has been submitted===>', test );
    let ret = JSON.parse(test.toString());
    console.log('Result', ret);
    gateway.disconnect();

    } catch (error) {
      console.error(`Something went wrong...: ${error}`);
      process.exit(1);
    }
  }
main();
