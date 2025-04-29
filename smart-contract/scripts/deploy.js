async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CarbonCertificate = await ethers.getContractFactory("CarbonCertificate");
    const carbonCertificate = await CarbonCertificate.deploy();
    console.log("CarbonCertificate contract deployed to:", carbonCertificate.address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
