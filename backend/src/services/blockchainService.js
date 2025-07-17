const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Load ABI from contract JSON file
const contractABIPath = path.join(
  __dirname,
  "../../../smart-contract/artifacts/contracts/Contract.sol/CarbonCertificate.json"
);
let contractABI;

try {
  const abiFile = fs.readFileSync(contractABIPath, "utf8");
  const contractData = JSON.parse(abiFile);
  contractABI = contractData.abi;

  // Verify ABI contains issueCertificate function
  const issueCertFunc = contractABI.find(
    (item) => item.type === "function" && item.name === "issueCertificate"
  );

  if (!issueCertFunc) {
    console.error("WARNING: issueCertificate function not found in ABI!");
  } else {
    console.log("issueCertificate function found in ABI");
  }
} catch (error) {
  console.error(`Error loading ABI file from ${contractABIPath}:`, error);
}

// Initialize blockchain connection
const provider = new ethers.JsonRpcProvider(process.env.BESU_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_BLOCKCHAIN, provider);
const contractAddress = process.env.CONTRACT_ADDRESS_SMARTCONTRACT;

// Create contract instance
const carbonContract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet
);

console.log(`Blockchain service initialized with:
- Provider: ${process.env.BESU_RPC_URL}
- Contract: ${contractAddress}
- Wallet: ${wallet.address}`);

// Verify blockchain connection
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
 * @param {Object} carbonData - Validated carbon data
 * @returns {Promise<Object>} - Transaction result with token data
 */
async function issueCarbonCertificate(recipientAddress, carbonData) {
  try {
    console.log(
      `Starting blockchain process for case ${carbonData._id} with ${carbonData.jumlahKarbon} carbon units`
    );

    // Input validation
    if (!recipientAddress) throw new Error("Recipient address is required");
    if (!carbonData) throw new Error("Carbon data is required");
    if (!carbonData._id) throw new Error("Carbon data must have _id");
    if (!carbonData.proposalId)
      throw new Error("Carbon data must have proposalId");

    // Date validation
    const startDate = new Date(carbonData.tanggalMulai);
    const endDate = new Date(carbonData.tanggalSelesai);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid start or end date");
    }

    // Amount validation
    const amount = parseInt(carbonData.jumlahKarbon);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Carbon amount must be a positive number");
    }

    // Create project ID for the certificate
    const projectId = `${carbonData._id.toString()}-${carbonData.proposalId.toString()}`;
    console.log(
      `Issuing ${amount} carbon certificates for project ${projectId} to ${recipientAddress}`
    );

    // Send transaction to the smart contract
    console.log("Calling contract issueCertificate function...");
    const tx = await carbonContract.issueCertificate(
      recipientAddress,
      amount,
      projectId,
      {
        gasLimit: 9000000, // Set a high gas limit to ensure transaction goes through
      }
    );

    console.log("Transaction sent with hash:", tx.hash);
    console.log("Waiting for transaction confirmation...");

    // Wait for transaction confirmation
    const receipt = await tx.wait(1);

    if (receipt.status !== 1) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }

    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // Extract token data from event logs
    const tokens = [];
    let foundEvents = false;

    // Process each log to find CertificateIssued events
    for (const log of receipt.logs) {
      try {
        // Try to parse the log
        const parsedLog = carbonContract.interface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog && parsedLog.name === "CertificateIssued") {
          foundEvents = true;
          const tokenData = {
            tokenId: parsedLog.args.tokenId.toString(),
            uniqueHash: parsedLog.args.uniqueHash,
            proposalId: carbonData.proposalId.toString(),
          };
          tokens.push(tokenData);
          console.log("Found token:", tokenData);
        }
      } catch (e) {
        // Skip logs that can't be parsed
        console.log("Could not parse log:", e.message);
      }
    }

    // If no tokens were found in the logs, return an error
    if (!foundEvents || tokens.length === 0) {
      console.error("No CertificateIssued events found in transaction logs");
      return {
        success: false,
        error: "No certificate tokens found in transaction logs",
        details:
          "The smart contract transaction succeeded but did not emit any CertificateIssued events",
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
      };
    }

    // Return successful result with real token data from blockchain
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
    console.error("Blockchain process failed:", error);

    // If it's a gas estimation error, try with a fixed gas amount
    if (
      error.message.includes("gas required exceeds allowance") ||
      error.message.includes("insufficient funds")
    ) {
      try {
        console.log("Trying alternative approach with fixed gas limit...");

        // Get estimated gas (but don't use .mul as it's not supported in ethers v6)
        const gasEstimate = await carbonContract.issueCertificate.estimateGas(
          recipientAddress,
          amount,
          projectId
        );

        console.log("Estimated gas:", gasEstimate.toString());

        // Add a buffer by multiplying the gas estimate (using numeric operations instead of .mul)
        const gasLimit = BigInt(Math.floor(Number(gasEstimate) * 1.5));

        // Send transaction with calculated gas limit
        const tx = await carbonContract.issueCertificate(
          recipientAddress,
          amount,
          projectId,
          {
            gasLimit: gasLimit,
          }
        );

        console.log("Alternative transaction sent with hash:", tx.hash);
        const receipt = await tx.wait(1);

        // Process logs to extract token data (same as above)
        const tokens = [];
        let foundEvents = false;

        for (const log of receipt.logs) {
          try {
            const parsedLog = carbonContract.interface.parseLog({
              topics: log.topics,
              data: log.data,
            });

            if (parsedLog && parsedLog.name === "CertificateIssued") {
              foundEvents = true;
              tokens.push({
                tokenId: parsedLog.args.tokenId.toString(),
                uniqueHash: parsedLog.args.uniqueHash,
                proposalId: carbonData.proposalId.toString(),
              });
            }
          } catch (e) {
            console.log("Could not parse log:", e.message);
          }
        }

        // Check if we found any token events
        if (!foundEvents || tokens.length === 0) {
          return {
            success: false,
            error: "No certificate tokens found in transaction logs",
            details:
              "The transaction succeeded but did not emit expected events",
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber,
          };
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
      } catch (altError) {
        console.error("Alternative approach also failed:", altError);
        return {
          success: false,
          error: altError.message,
          details:
            altError.reason ||
            altError.code ||
            "Unknown error during alternative approach",
        };
      }
    }

    // Return error information
    return {
      success: false,
      error: error.message,
      details: error.reason || error.code || "Unknown error",
    };
  }
}

/**
 * Get certificate details by unique hash
 * @param {string} uniqueHash - Certificate's unique hash
 * @returns {Promise<Object>} - Certificate details
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
 * Verify certificate validity by unique hash
 * @param {string} uniqueHash - Certificate's unique hash
 * @returns {Promise<Object>} - Verification result
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
 * Test contract connection and validate main functions
 * @returns {Promise<boolean>} - Connection status
 */
async function testContractConnection() {
  try {
    console.log("Testing contract connection...");
    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);

    // Check if totalSupply function is available
    if (typeof carbonContract.totalSupply === "function") {
      const supply = await carbonContract.totalSupply();
      console.log("Total supply:", supply.toString());
    }

    // Check contract owner
    if (typeof carbonContract.owner === "function") {
      const owner = await carbonContract.owner();
      console.log("Contract owner:", owner);
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

    // Check blockchain connection
    const network = await provider.getNetwork();
    console.log("Connected to network:", {
      chainId: network.chainId,
      name: network.name || "Unknown",
    });

    // Check wallet address and balance
    console.log("Wallet address:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("Wallet balance:", ethers.formatEther(balance), "ETH");

    // Check contract
    console.log("Contract address:", contractAddress);
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("ERROR: No contract found at specified address!");
      return { success: false, error: "No contract at address" };
    }
    console.log("Contract code exists, length:", code.length);

    // List available contract functions
    if (carbonContract.interface && carbonContract.interface.fragments) {
      const functions = carbonContract.interface.fragments
        .filter((f) => f.type === "function")
        .map((f) => f.name);
      console.log("Available contract functions:", functions);
    } else {
      console.log("Contract interface functions not accessible");
    }

    // Check contract owner
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

    // Check token ID counter
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
