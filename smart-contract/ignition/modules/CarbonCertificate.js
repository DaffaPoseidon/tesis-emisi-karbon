const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployModule", (m) => {
  const carbonCertificate = m.contract("CarbonCertificate");

  return { carbonCertificate };
});