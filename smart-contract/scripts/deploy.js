// async function main() {
//     const [deployer] = await ethers.getSigners();
//     console.log("Deploying contracts with the account:", deployer.address);

//     const CarbonCertificate = await ethers.getContractFactory("CarbonCertificate");
//     const carbonCertificate = await CarbonCertificate.deploy();
//     console.log("CarbonCertificate contract deployed to:", carbonCertificate.address);
// }

// main().catch((error) => {
//     console.error(error);
//     process.exit(1);
// });

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CarbonCertificate = await ethers.getContractFactory("CarbonCertificate");
    console.log("Deploying CarbonCertificate contract...");
    
    const carbonCertificate = await CarbonCertificate.deploy();
    
    // Tunggu hingga kontrak benar-benar di-deploy
    await carbonCertificate.deployed();
    
    console.log("CarbonCertificate contract deployed to:", carbonCertificate.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});