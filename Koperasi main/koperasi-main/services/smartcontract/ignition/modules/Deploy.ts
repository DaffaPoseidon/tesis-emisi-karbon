import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const token = m.contract("ProjectToken");

  return { token };
});

export default DeployModule;
