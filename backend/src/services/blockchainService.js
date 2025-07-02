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

    // Call smart contract to issue certificates and create tokens
    const tx = await carbonContract.issueCertificate(
      recipientAddress,
      amount,
      projectId
    );

    console.log("Transaction submitted with hash:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Parse events to get token data with unique hashes
    const events = [];
    const iface = new ethers.Interface(contractABI);

    for (const log of receipt.logs) {
      try {
        // Only process logs from our contract
        if (log.address.toLowerCase() !== contractAddress.toLowerCase())
          continue;

        // Format log for parsing
        const logDescription = iface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });

        if (logDescription && logDescription.name === "CertificateIssued") {
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
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get certificate details from blockchain by unique hash
 * @param {string} uniqueHash - Certificate's unique hash
 * @returns {Promise<Object>} Certificate details
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
 * Verify certificate authenticity on blockchain
 * @param {string} uniqueHash - Hash to verify
 * @returns {Promise<Object>} Verification result
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

module.exports = {
  issueCarbonCertificate,
  getCertificateByHash,
  verifyCertificate,
};
