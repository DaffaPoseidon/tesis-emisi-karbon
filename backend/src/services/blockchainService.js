const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI from the compiled contract JSON file
const contractABIPath = path.join(
  __dirname,
  "../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json"
);
let contractABI;

try {
  const abiFile = fs.readFileSync(contractABIPath, "utf8");
  contractABI = JSON.parse(abiFile).abi;

  // Verifikasi ABI mengandung fungsi issueCertificate
  const issueCertFunc = contractABI.find(
    (item) => item.type === "function" && item.name === "issueCertificate"
  );

  if (!issueCertFunc) {
    console.error(
      "PERINGATAN: Fungsi issueCertificate tidak ditemukan dalam ABI!"
    );
  } else {
    console.log("Fungsi issueCertificate ditemukan dalam ABI:", issueCertFunc);
  }
} catch (error) {
  console.error(`Error loading ABI file from ${contractABIPath}:`, error);
  process.exit(1);
}

// Environment validation
if (!process.env.BESU_RPC_URL) {
  console.error("BESU_RPC_URL is not defined in environment variables");
  process.exit(1);
}

if (!process.env.PRIVATE_KEY_BLOCKCHAIN) {
  console.error(
    "PRIVATE_KEY_BLOCKCHAIN is not defined in environment variables"
  );
  process.exit(1);
}

if (!process.env.CONTRACT_ADDRESS_SMARTCONTRACT) {
  console.error(
    "CONTRACT_ADDRESS_SMARTCONTRACT is not defined in environment variables"
  );
  process.exit(1);
}

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_BLOCKCHAIN, provider);
const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;
const carbonContract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

console.log(`Blockchain service initialized with:
- Provider: ${process.env.BESU_RPC_URL}
- Contract: ${contractAddress}
- Wallet: ${wallet.address}`);

// Check blockchain connection
provider
  .getBlockNumber()
  .then((blockNumber) => {
    console.log(
      `Successfully connected to blockchain. Current block: ${blockNumber}`
    );

    // Verifikasi kontrak dapat diakses
    return carbonContract
      .owner()
      .then((owner) => {
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
          console.warn(
            "PERINGATAN: Wallet saat ini bukan owner kontrak, mungkin ada masalah izin"
          );
        }
      })
      .catch((err) => {
        console.error("Error accessing contract:", err.message);
      });
  })
  .catch((err) => {
    console.error(`Failed to connect to blockchain: ${err.message}`);
  });

/**
 * Issue carbon certificates on the blockchain after validator approval
 * @param {string} recipientAddress - Seller's blockchain address
 * @param {Object} carbonCase - Validated carbon data
 * @returns {Promise<Object>} - Transaction result with token data
 */
async function issueCarbonCertificate(recipientAddress, carbonCase) {
  try {
    // Verifikasi kontrak memiliki fungsi yang diharapkan
    if (typeof carbonContract.issueCertificate !== "function") {
      console.error("Fungsi issueCertificate tidak ditemukan dalam kontrak");
      throw new Error("Kontrak tidak memiliki fungsi yang diharapkan");
    }

    // Ensure amount is a valid number
    const amount = parseInt(carbonCase.jumlahKarbon);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Carbon amount must be a positive number");
    }

    // Use case ID as project identifier
    const projectId = carbonCase._id.toString();

    console.log(
      `Issuing ${amount} carbon certificates for project ${projectId} to ${recipientAddress}`
    );

    // Log parameter untuk debugging
    console.log("Parameter fungsi:", {
      recipientAddress,
      amount,
      projectId,
    });

    // Call smart contract to issue certificates and create tokens
    // Tambahkan gas limit dan pastikan tipe parameter benar
    const tx = await carbonContract.issueCertificate(
      recipientAddress,
      amount,
      projectId,
      { gasLimit: 5000000 } // Tambahkan gas limit yang cukup
    );

    // Log detail transaksi untuk debugging
    console.log("Detail transaksi:", {
      from: tx.from,
      to: tx.to,
      data: tx.data, // Ini TIDAK boleh kosong
      hash: tx.hash,
    });

    console.log("Transaction submitted with hash:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log(
      "Receipt transaksi:",
      JSON.stringify({
        status: receipt.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        logs: receipt.logs.length,
      })
    );

    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Parse events to get token data with unique hashes
    const events = [];
    const iface = new ethers.Interface(contractABI);

    for (const log of receipt.logs) {
      try {
        // Only process logs from our contract
        if (log.address.toLowerCase() !== contractAddress.toLowerCase())
          continue;

        console.log("Processing log from contract address:", log.address);
        console.log("Log topics:", log.topics);
        console.log("Log data:", log.data);

        // Format log untuk parsing
        const parsedLog = {
          topics: [...log.topics],
          data: log.data,
        };

        // Coba parse log
        const logDescription = iface.parseLog(parsedLog);
        console.log(
          "Log description:",
          logDescription ? logDescription.name : "Failed to parse"
        );

        if (logDescription && logDescription.name === "CertificateIssued") {
          console.log(
            "Found CertificateIssued event, args:",
            logDescription.args
          );

          const { args } = logDescription;

          events.push({
            tokenId: args.tokenId.toString(),
            recipient: args.recipient,
            carbonAmount: args.carbonAmount.toString(),
            projectId: args.projectId,
            uniqueHash: args.uniqueHash,
          });

          console.log(
            "Token data retrieved from blockchain:",
            events[events.length - 1]
          );
        }
      } catch (e) {
        console.error("Error parsing log:", e);
        console.error("Log that caused error:", JSON.stringify(log));
        // Continue processing other logs
      }
    }

    // Collect token IDs and unique hashes
    const tokenData = events.map((event) => ({
      tokenId: event.tokenId,
      uniqueHash: event.uniqueHash,
    }));

    // Verify we received token data
    if (tokenData.length === 0) {
      throw new Error(
        "No tokens were detected from blockchain events. Check smart contract implementation."
      );
    }

    // Return blockchain data to be stored in MongoDB
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      tokens: tokenData,
      recipient: recipientAddress,
      carbonAmount: amount,
      projectId: projectId,
      issuedOn: Date.now(),
    };
  } catch (error) {
    console.error("Error issuing carbon certificate:", error);

    // Error reporting lebih detail
    if (error.transaction) {
      console.error("Transaksi yang gagal:", error.transaction);
    }
    if (error.receipt) {
      console.error("Detail receipt transaksi:", {
        status: error.receipt.status,
        gasUsed: error.receipt.gasUsed.toString(),
        blockNumber: error.receipt.blockNumber,
      });
    }

    return {
      success: false,
      error: error.message,
      details: error.reason || "Unknown reason for transaction failure",
    };
  }
}

// Rest of the functions remain the same
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

module.exports = {
  issueCarbonCertificate,
  getCertificateByHash,
  verifyCertificate,
};
