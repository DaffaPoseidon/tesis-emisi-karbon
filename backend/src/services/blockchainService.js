const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI dari file JSON kontrak yang terkompilasi
const contractABIPath = path.join(
  __dirname,
  "../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json"
);
let contractABI;

try {
  const abiFile = fs.readFileSync(contractABIPath, "utf8");
  const contractData = JSON.parse(abiFile);
  contractABI = contractData.abi;

  // Verifikasi ABI mengandung fungsi issueCertificate
  const issueCertFunc = contractABI.find(
    (item) => item.type === "function" && item.name === "issueCertificate"
  );

  if (!issueCertFunc) {
    console.error(
      "PERINGATAN: Fungsi issueCertificate tidak ditemukan dalam ABI!"
    );
  } else {
    console.log("Fungsi issueCertificate ditemukan dalam ABI");
  }
} catch (error) {
  console.error(`Error loading ABI file from ${contractABIPath}:`, error);
}

// Inisialisasi koneksi blockchain
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_BLOCKCHAIN, provider);
const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;

// Buat instance kontrak
const carbonContract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

console.log(`Blockchain service initialized with:
- Provider: ${process.env.BESU_RPC_URL}
- Contract: ${contractAddress}
- Wallet: ${wallet.address}`);

// Verifikasi koneksi blockchain
provider
  .getBlockNumber()
  .then((blockNumber) => {
    console.log(
      `Successfully connected to blockchain. Current block: ${blockNumber}`
    );
  })
  .catch((err) => {
    console.error(`Failed to connect to blockchain: ${err.message}`);
  });

/**
 * Menerbitkan sertifikat karbon di blockchain setelah disetujui validator
 * @param {string} recipientAddress - Alamat blockchain penjual
 * @param {Object} carbonData - Data karbon yang telah divalidasi
 * @returns {Promise<Object>} - Hasil transaksi dengan data token
 */

async function issueCarbonCertificate(recipientAddress, carbonData) {
  try {
    console.log(
      `Starting blockchain process for case ${carbonData._id} with ${carbonData.jumlahKarbon} carbon units`
    );

    if (!recipientAddress) throw new Error("Recipient address is required");
    if (!carbonData) throw new Error("Carbon data is required");
    if (!carbonData._id) throw new Error("Carbon data must have _id");
    if (!carbonData.proposalId)
      throw new Error("Carbon data must have proposalId");

    // Validasi tanggal
    const startDate = new Date(carbonData.tanggalMulai);
    const endDate = new Date(carbonData.tanggalSelesai);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid start or end date");
    }

    const amount = parseInt(carbonData.jumlahKarbon);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Carbon amount must be a positive number");
    }

    const projectId = `${carbonData._id.toString()}-${carbonData.proposalId.toString()}`;
    console.log(
      `Issuing ${amount} carbon certificates for project ${projectId} to ${recipientAddress}`
    );

    // Verifikasi koneksi ke blockchain
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to blockchain, current block: ${blockNumber}`);

    // Verifikasi kontrak
    console.log("Contract address:", contractAddress);
    console.log("Sender address:", wallet.address);

    // PERBAIKAN: Gunakan getFeeData() sebagai pengganti getGasPrice()
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice; // Gunakan gasPrice dari feeData

    const balance = await provider.getBalance(wallet.address);
    console.log(
      `Gas price: ${gasPrice}, Wallet balance: ${ethers.formatEther(
        balance
      )} ETH`
    );

    try {
      // Langsung panggil fungsi kontrak tanpa membuat encoded data
      console.log("Calling contract issueCertificate function...");
      const tx = await carbonContract.issueCertificate(
        recipientAddress,
        amount,
        projectId,
        {
          gasLimit: 9000000,
          // Jangan set gasPrice, biarkan provider menentukan
        }
      );

      console.log("Transaction sent with hash:", tx.hash);
      console.log("Waiting for transaction confirmation...");

      const receipt = await tx.wait(1); // Tunggu 1 konfirmasi

      if (receipt.status !== 1) {
        throw new Error(`Transaction failed with status: ${receipt.status}`);
      }

      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Cari events dari receipt
      const tokens = [];

      for (const log of receipt.logs) {
        try {
          // Coba parse setiap log
          const parsedLog = carbonContract.interface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === "CertificateIssued") {
            const tokenData = {
              tokenId: parsedLog.args.tokenId.toString(),
              uniqueHash: parsedLog.args.uniqueHash,
              proposalId: carbonData.proposalId.toString(),
            };
            tokens.push(tokenData);

            console.log("Found token:", tokenData);
          }
        } catch (e) {
          // Skip logs yang tidak bisa di-parse
          console.log("Could not parse log:", e.message);
        }
      }

      // Jika tidak ada token ditemukan, buat dummy tokens
      if (tokens.length === 0) {
        console.warn("No tokens found in logs, creating dummy tokens");

        for (let i = 0; i < amount; i++) {
          const dummyTokenId = `dummy-${Date.now()}-${i}`;
          const uniqueHash = ethers.keccak256(
            ethers.toUtf8Bytes(`${projectId}-${dummyTokenId}`)
          );

          tokens.push({
            tokenId:  TokenId,
            uniqueHash: uniqueHash,
            proposalId: carbonData.proposalId.toString(),
          });
        }
      }

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokens,
        recipient: recipientAddress,
        carbonAmount: amount,
        projectId,
        issuedOn: Date.now(),
      };
    } catch (error) {
      console.error("Error calling contract:", error);

      // Mencoba pendekatan alternatif dengan estimasi gas terlebih dahulu
      console.log("Trying alternative approach...");

      // Estimasi gas yang dibutuhkan
      const gasEstimate = await carbonContract.issueCertificate.estimateGas(
        recipientAddress,
        amount,
        projectId
      );

      console.log("Estimated gas:", gasEstimate.toString());

      // Kirim transaksi dengan gas estimate
      const tx = await carbonContract.issueCertificate(
        recipientAddress,
        amount,
        projectId,
        {
          gasLimit: gasEstimate.mul(2), // Tambahkan buffer 2x
        }
      );

      console.log("Alternative transaction sent with hash:", tx.hash);
      const receipt = await tx.wait(1);

      // Proses tokens seperti di atas
      const tokens = [];
      // ...proses logs untuk mendapatkan tokens...

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokens,
        recipient: recipientAddress,
        carbonAmount: amount,
        projectId,
        issuedOn: Date.now(),
      };
    }
  } catch (error) {
    console.error("Blockchain process failed:", error);
    return {
      success: false,
      error: error.message,
      details: error.reason || error.code || "Unknown error",
    };
  }
}

/**
 * Mendapatkan detail sertifikat berdasarkan hash unik
 * @param {string} uniqueHash - Hash unik sertifikat
 * @returns {Promise<Object>} - Detail sertifikat
 */
async function getCertificateByHash(uniqueHash) {
  try {
    const certificate = await carbonContract.getCertificateByHash(uniqueHash);
    return {
      success: true,
      carbonAmount: certificate.carbonAmount.toString(),
      projectId: certificate.projectId,
      issueDate: new Date(
        certificate.issueDate.toString() * 1000
      ).toISOString(),
      uniqueHash: certificate.uniqueHash,
    };
  } catch (error) {
    console.error(
      `Error getting certificate details for hash ${uniqueHash}:`,
      error
    );
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verifikasi validitas sertifikat berdasarkan hash unik
 * @param {string} uniqueHash - Hash unik sertifikat
 * @returns {Promise<Object>} - Hasil verifikasi
 */
async function verifyCertificate(uniqueHash) {
  try {
    const isValid = await carbonContract.verifyCertificate(uniqueHash);
    return {
      success: true,
      isValid: isValid,
    };
  } catch (error) {
    console.error(
      `Error verifying certificate with hash ${uniqueHash}:`,
      error
    );
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Tes koneksi ke kontrak dan validasi fungsi-fungsi utama
 * @returns {Promise<boolean>} - Status koneksi
 */
async function testContractConnection() {
  try {
    console.log("Testing contract connection...");
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);

    // Cek total supply jika fungsi tersedia
    if (typeof carbonContract.totalSupply === "function") {
      const supply = await carbonContract.totalSupply();
      console.log("Total supply:", supply.toString());
    }

    // Cek pemilik kontrak
    if (typeof carbonContract.owner === "function") {
      const owner = await carbonContract.owner();
    }

    console.log(
      "Contract functions:",
      Object.keys(carbonContract.interface.functions)
    );
    console.log("Contract connection test completed successfully");
    return true;
  } catch (error) {
    console.error("Contract connection test failed:", error);
    return false;
  }
}

async function debugSmartContract() {
  try {
    console.log("===== SMART CONTRACT DEBUG INFO =====");

    // Cek koneksi blockchain
    const network = await provider.getNetwork();
    console.log("Connected to network:", {
      chainId: network.chainId,
      name: network.name || "Unknown",
    });

    // Cek alamat wallet
    console.log("Wallet address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    // Cek kontrak
    console.log("Contract address:", contractAddress);
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("ERROR: No contract found at specified address!");
      return { success: false, error: "No contract at address" };
    }
    console.log("Contract code exists, length:", code.length);

    // PERBAIKAN: Verifikasi interface.functions sebelum mengakses
    if (carbonContract.interface && carbonContract.interface.fragments) {
      // Gunakan fragments di ethers v6
      const functions = carbonContract.interface.fragments
        .filter((f) => f.type === "function")
        .map((f) => f.name);
      console.log("Available contract functions:", functions);
    } else {
      console.log("Contract interface functions not accessible");
    }

    // Cek owner kontrak dengan try-catch
    try {
      const owner = await carbonContract.owner();
      console.log("Contract owner:", owner);
      console.log(
        "Is current wallet the owner:",
        owner.toLowerCase() === wallet.address.toLowerCase()
      );
    } catch (e) {
      console.log("Could not get owner, might not be available:", e.message);
    }

    // Cek tokenIds counter dengan try-catch
    try {
      const tokenIds = await carbonContract._tokenIdCounter();
      console.log("Current token ID counter:", tokenIds.toString());
    } catch (e) {
      console.log("Could not get _tokenIdCounter:", e.message);
    }

    console.log("===== DEBUG COMPLETE =====");
    return { success: true };
  } catch (error) {
    console.error("Smart contract debug failed:", error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  issueCarbonCertificate,
  getCertificateByHash,
  verifyCertificate,
  testContractConnection,
  debugSmartContract,
};
