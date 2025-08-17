import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AemulaETHGlobalModule", (m) => {
  const usdc = m.getParameter<string>("usdc");
  const treasury = m.getParameter<string>("treasury");

  const aemula = m.contract("AemulaETHGlobal", [usdc, treasury]);
  return { aemula };
});