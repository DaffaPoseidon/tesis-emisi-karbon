// Load Hardhat environment
const hre = require("hardhat");

async function main() {
    console.log("🔍 Compiling contracts...");

    // Compile the contract using Hardhat
    await hre.run('compile');

    console.log("✅ Compilation successful!");
}

// Run the main function and catch any errors
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
