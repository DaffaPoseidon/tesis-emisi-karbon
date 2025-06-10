const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI dari file JSON yang dihasilkan saat kompilasi kontrak
const contractABIPath = path.join(__dirname, '../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json');
const contractABI = JSON.parse(fs.readFileSync(contractABIPath, 'utf8')).abi;

// Check ethers version and use appropriate provider syntax
// For ethers v6
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL || "http://127.0.0.1:8545");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "1bda73f51aeccda93af5e06826dc4fefec67d283911bbc14ebbb1680aeb774d0", provider);
const contractAddress = process.env.CONTRACT_ADDRESS || "0x16976173761B80b94f807C7b9d9f768FF9a8DF69";
const carbonContract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Menerbitkan sertifikat karbon ke blockchain
 * @param {string} recipient - Alamat penerima sertifikat 
 * @param {number} carbonAmount - Jumlah karbon dalam ton
 * @param {string} projectId - ID proyek (bisa berupa ID dari MongoDB)
 * @returns {Promise<Object>} - Hasil transaksi dari blockchain
 */
async function issueCarbonCertificate(recipient, carbonAmount, projectId) {
  try {
    // Pastikan carbonAmount adalah angka
    const amount = parseInt(carbonAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Jumlah karbon harus berupa angka positif");
    }

    console.log(`Issuing ${amount} carbon certificates for project ${projectId} to ${recipient}`);

    // Panggil fungsi smart contract
    const tx = await carbonContract.issueCertificate(
      recipient,
      amount,
      projectId
    );

    console.log("Transaction hash:", tx.hash);
    
    // Tunggu konfirmasi transaksi
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Parse event dari receipt untuk mendapatkan token IDs
    // Adjust this for ethers v6
    const events = receipt.logs.filter(log => {
      try {
        const parsed = carbonContract.interface.parseLog(log);
        return parsed && parsed.name === 'CertificateIssued';
      } catch (e) {
        return false;
      }
    }).map(log => {
      const parsed = carbonContract.interface.parseLog(log);
      return {
        args: parsed.args
      };
    });

    const tokenIds = events.map(event => event.args[0].toString());
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokenIds: tokenIds,
      recipient: recipient,
      carbonAmount: amount,
      projectId: projectId
    };
  } catch (error) {
    console.error("Error issuing carbon certificate:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mengambil detail sertifikat dari blockchain
 * @param {string} tokenId - ID token sertifikat yang akan diambil
 * @returns {Promise<Object>} Detail sertifikat
 */
async function getCertificateDetails(tokenId) {
  try {
    const certificate = await carbonContract.getCertificate(tokenId);
    return {
      success: true,
      carbonAmount: certificate[0].toString(),
      projectId: certificate[1],
      issueDate: new Date(certificate[2].toString() * 1000).toISOString()
    };
  } catch (error) {
    console.error(`Error getting certificate details for token ${tokenId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  issueCarbonCertificate,
  getCertificateDetails
};