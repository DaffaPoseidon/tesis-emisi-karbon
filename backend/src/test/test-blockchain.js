require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function testBlockchainConnection() {
  console.log('=== TESTING BLOCKCHAIN CONNECTION ===');
  
  try {
    // 1. Check environment variables
    console.log('Checking environment variables...');
    const rpcUrl = process.env.BESU_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_BLOCKCHAIN;
    const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;
    
    if (!rpcUrl) throw new Error('BESU_RPC_URL is not defined');
    if (!privateKey) throw new Error('PRIVATE_KEY_BLOCKCHAIN is not defined');
    if (!contractAddress) throw new Error('CONTRACT_ADDRESS_SMARTCONTRACT is not defined');
    
    console.log('RPC URL:', rpcUrl);
    console.log('Contract Address:', contractAddress);
    console.log('Using private key:', privateKey.substring(0, 6) + '...');
    
    // 2. Connect to the blockchain
    console.log('\nConnecting to blockchain...');
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      chainId: network.chainId,
      name: network.name
    });
    
    // 3. Check wallet
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet address:', wallet.address);
    console.log('Wallet balance:', ethers.formatEther(balance), 'ETH');
    
    // 4. Check contract
    console.log('\nChecking contract...');
    const contractCode = await provider.getCode(contractAddress);
    if (contractCode === '0x') {
      throw new Error('No contract found at the specified address');
    }
    console.log('Contract exists at address:', contractAddress);
    
    // 5. Load contract ABI
    const abiPath = path.join(__dirname, '../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json');
    const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
    console.log('Contract ABI loaded successfully');
    
    // 6. Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    console.log('Contract instance created successfully');
    
    // 7. Try to get token count
    const nextTokenId = await contract._tokenIds();
    console.log('Next token ID:', nextTokenId.toString());
    
    console.log('\n✅ Blockchain connection test PASSED!');
    return true;
  } catch (error) {
    console.error('\n❌ Blockchain connection test FAILED!');
    console.error('Error:', error.message);
    return false;
  }
}

// Run the test
testBlockchainConnection();