const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI dari file JSON yang dihasilkan saat kompilasi kontrak
const contractABIPath = path.join(__dirname, '../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json');
let contractABI;

try {
  const abiFile = fs.readFileSync(contractABIPath, 'utf8');
  contractABI = JSON.parse(abiFile).abi;
} catch (error) {
  console.error(`Error loading ABI file from ${contractABIPath}:`, error);
  process.exit(1); // Fatal error - exit the application
}

// Setup provider dan wallet tanpa fallback
if (!process.env.BESU_RPC_URL) {
  console.error("BESU_RPC_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.PRIVATE_KEY_BLOCKCHAIN) {
  console.error("PRIVATE_KEY_BLOCKCHAIN is not defined in environment variables");
  process.exit(1);
}

if (!process.env.CONTRACT_ADDRESS_SMARTCONTRACT) {
  console.error("CONTRACT_ADDRESS_SMARTCONTRACT is not defined in environment variables");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_BLOCKCHAIN, provider);
const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;
const carbonContract = new ethers.Contract(contractAddress, contractABI, wallet);

console.log(`Blockchain service initialized with:
- Provider: ${process.env.BESU_RPC_URL}
- Contract: ${contractAddress}
- Wallet: ${wallet.address}`);

/**
 * Menerbitkan sertifikat karbon ke blockchain dengan token unik
 * @param {string} recipient - Alamat penerima sertifikat 
 * @param {number} carbonAmount - Jumlah karbon dalam ton
 * @param {string} projectId - ID proyek (dari MongoDB)
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

    // Panggil fungsi smart contract yang akan menghasilkan token unik
    console.log("Memanggil kontrak di alamat:", contractAddress);
    const tx = await carbonContract.issueCertificate(
      recipient,
      amount,
      projectId
    );

    console.log("Transaction hash:", tx.hash);
    
    // Tunggu konfirmasi transaksi
    console.log("Menunggu konfirmasi transaksi...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
// Parse event untuk mendapatkan token unik (uniqueHash)
console.log("Parsing events dari receipt dengan log count:", receipt.logs.length);
console.log("Contract address untuk filter:", contractAddress.toLowerCase());

// Log semua event topics untuk debugging
receipt.logs.forEach((log, i) => {
  console.log(`Log #${i} address: ${log.address.toLowerCase()}, topics:`, log.topics);
});

// Filter hanya log dari kontrak kita
const contractLogs = receipt.logs.filter(log => 
  log.address.toLowerCase() === contractAddress.toLowerCase()
);
console.log(`Filtered logs dari kontrak kita: ${contractLogs.length}`);

// // Parse event secara manual (perbaikan utama)
// const events = [];
// for (const log of contractLogs) {
//   try {
//     // Untuk ethers v6, gunakan parseLog dengan bentuk yang benar
//     const parsedLog = carbonContract.interface.parseLog({
//       topics: log.topics,
//       data: log.data
//     });
    
//     if (parsedLog && parsedLog.name === 'CertificateIssued') {
//       console.log("Event CertificateIssued ditemukan!", parsedLog.args);
      
//       // Pastikan args memiliki 5 parameter sesuai event definition
//       events.push({
//         tokenId: parsedLog.args[0].toString(),
//         recipient: parsedLog.args[1],
//         carbonAmount: parsedLog.args[2].toString(),
//         projectId: parsedLog.args[3],
//         uniqueHash: parsedLog.args[4]  // Ini adalah bytes32
//       });
//       console.log("Event parsed:", events[events.length-1]);
//     } else if (parsedLog) {
//       console.log("Event lain ditemukan:", parsedLog.name);
//     }
//   } catch (error) {
//     console.log("Error parsing log:", error.message);
//   }
// }

// Alternatif pendekatan parsing event jika cara di atas masih gagal
const events = [];
const iface = new ethers.Interface(contractABI);

for (const log of receipt.logs) {
  try {
    // Hanya proses log dari kontrak kita
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
    
    // Format log untuk parsing
    const logDescription = iface.parseLog({
      topics: [...log.topics],
      data: log.data
    });
    
    if (logDescription && logDescription.name === 'CertificateIssued') {
      const { args } = logDescription;
      
      // Format data dengan benar
      events.push({
        tokenId: args.tokenId.toString(),
        recipient: args.recipient,
        carbonAmount: args.carbonAmount.toString(),
        projectId: args.projectId,
        uniqueHash: args.uniqueHash
      });
      
      console.log("Token berhasil diparsing:", events[events.length-1]);
    }
  } catch (e) {
    // Ignore parsing errors for non-matching logs
  }
}

console.log(`Jumlah event CertificateIssued yang berhasil di-parse: ${events.length}`);
    
    // Kumpulkan token ID dan hash unik
    const tokenData = events.map(event => ({
      tokenId: event.tokenId,
      uniqueHash: event.uniqueHash
    }));
    
    console.log("Generated tokens:", tokenData);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokens: tokenData,
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
 * Mengambil detail sertifikat dari blockchain berdasarkan uniqueHash
 * @param {string} uniqueHash - Hash unik sertifikat yang akan diambil
 * @returns {Promise<Object>} Detail sertifikat
 */
async function getCertificateByHash(uniqueHash) {
  try {
    const certificate = await carbonContract.getCertificateByHash(uniqueHash);
    return {
      success: true,
      carbonAmount: certificate.carbonAmount.toString(),
      projectId: certificate.projectId,
      issueDate: new Date(certificate.issueDate.toString() * 1000).toISOString(),
      uniqueHash: certificate.uniqueHash
    };
  } catch (error) {
    console.error(`Error getting certificate details for hash ${uniqueHash}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verifikasi keberadaan sertifikat dengan hash tertentu
 * @param {string} uniqueHash - Hash unik yang akan diverifikasi
 * @returns {Promise<boolean>} Hasil verifikasi
 */
async function verifyCertificate(uniqueHash) {
  try {
    const isValid = await carbonContract.verifyCertificate(uniqueHash);
    return {
      success: true,
      isValid: isValid
    };
  } catch (error) {
    console.error(`Error verifying certificate with hash ${uniqueHash}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  issueCarbonCertificate,
  getCertificateByHash,
  verifyCertificate
};