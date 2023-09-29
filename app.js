const express = require('express');
const bodyParser = require('body-parser');

const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const uIdentity = 'admin';
const channel = 'mychannel';
const ccpPath = path.resolve(__dirname, 'connection.yaml');
const ccp = yaml.load(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = path.resolve(__dirname, 'wallet');
const contractName = 'rmoffer_7';


// Set up the express app
const app = express();
const router = express.Router();

// configure the app to use bodyParser()
app.use(bodyParser.json());

// handle unexpected errors
app.use(function(err, req, res, next) {
  console.debug({ query: req.query, params: req.params, body: req.body });
  console.error(err);
  res.status(500).json({ message: 'Error, check logs...'});
  // process.exit();
});

// Read Offer
async function readOffer(req, res) {
    try{
        const offerId = req.params._id || 'x';
        const gateway = new Gateway();
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        await gateway.connect(ccp, { wallet, identity: uIdentity , discovery: {enabled: true, asLocalhost:false }});
        const network = await gateway.getNetwork(channel);
        const contract = network.getContract(contractName);
        let test = await contract.submitTransaction('ReadReliablyMeOffer', offerId);
        console.log('Transaction has been submitted');
        let ret = JSON.parse(test.toString());
        console.log('Result', ret);
        res.status(200).send(ret);
        gateway.disconnect();
    } catch (error) {
      console.error(`Failed to submit transaction(readOffer): ${error}`);
      res.status(500).send({ message: error });  
    }
}
// End Read Offer

// Read All Offers
async function readAllOffers(req, res) {
  try{
      const gateway = new Gateway();
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      await gateway.connect(ccp, { wallet, identity: uIdentity , discovery: {enabled: true, asLocalhost:false }});
      const network = await gateway.getNetwork(channel);
      const contract = network.getContract(contractName);
      let test = await contract.submitTransaction('GetAllOffers');
      console.log('Transaction has been submitted');
      let ret = JSON.parse(test.toString());
      console.log('Result', ret);
      res.status(200).send(ret);
      gateway.disconnect();
  } catch (error) {
    console.error(`Failed to submit transaction(readAllOffers): ${error}`);
    res.status(500).send({ message: error });  
  }
}
// End Read All Offers

// Create Offer
async function createOffer(req, res) {
    try {
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: uIdentity , discovery: {enabled: true, asLocalhost:false }});
      const network = await gateway.getNetwork(channel);
      const contract = network.getContract(contractName);
    
      let committer = req.body.committer;
      let issuer = req.body.issuer;
      let badge = req.body.badge;
      let createdDate = req.body.createdDate;
      let checksum = req.body.checksum;
      let status = req.body.status;
      console.log ('##########=>', committer, issuer, badge, createdDate, checksum, status);
      let test = await contract.submitTransaction('CreateReliablyMeOffer', committer, issuer, badge, createdDate, checksum, status);
      console.log('Created==>', test)
      let ret = {
        _id: test.toString()
      }
      res.status(200).send(ret);
      gateway.disconnect();
    } catch (error) {
      console.error(`Failed to submit transaction(createOffer): ${error}`);
      res.status(500).send({ message: error });
    }
}
// End Create Offer

// Update Offer
async function updateOffer(req, res) {
    try {
      let commitmentDate = req.body.commitmentDate === null ? '' : req.body.commitmentDate;
      commitmentDate = commitmentDate === undefined ? '' : commitmentDate;
      let completedDate = req.body.completedDate === null ? '' : req.body.completedDate;
      completedDate = completedDate === undefined ? '' : completedDate;
      let approvedDate = req.body.approvedDate === null ? '' : req.body.approvedDate;
      approvedDate = approvedDate === undefined ? '' : approvedDate;
      let rejectedDate = req.body.rejectedDate === null ? '' : req.body.rejectedDate;
      rejectedDate = rejectedDate === undefined ? '' : rejectedDate;
      let dueDate = req.body.dueDate === null ? '' : req.body.dueDate;
      dueDate = dueDate === undefined ? '' : dueDate;
      let status = '';
      if (req.body.status === null || req.body.status === undefined) {
          return res.status(500).send({ message: 'Invalid status'});
      } else {
          status = req.body.status;
      }
      
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      const gateway = new Gateway();
      await gateway.connect(ccp, { wallet, identity: uIdentity , discovery: {enabled: true, asLocalhost:false }});
      const network = await gateway.getNetwork(channel);
      const contract = network.getContract(contractName);
      let test = await contract.submitTransaction('UpdateReliablyMeOffer', req.params._id, commitmentDate, completedDate, approvedDate, rejectedDate, dueDate, status);
      
      console.log('Updated===>', test);
      let ret = {
        _id: test.toString()
      }
      res.status(200).send(ret);
      gateway.disconnect();
    } catch (error) {
        console.error(`Failed to submit transaction(updateOffer): ${error}`);
        res.status(500).send({ message: error });
    }
}
// End Update Offer

// Routes
router
  .get('/', async function (req, res) {
    let result = { message: 'ReliablyME BCMS-AMB API' };
    res.status(200).send(result);
  })
  // Create offer
  .post('/offer', createOffer)
  // Read offer
  .get('/offer/:_id', readOffer)
  // Read offer
  .get('/offers/', readAllOffers)
  // Update offer
  .put('/offer/:_id', updateOffer)
  
;

app.use('/api/v1.0/', router);

let PORT = 1338; // 80;

app.listen(PORT, function() {
  console.log('server running on port '+PORT)
});