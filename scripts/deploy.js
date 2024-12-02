const hre = require("hardhat");

async function main() {
  // Step 1: Deploy the contract
  const Assessment = await hre.ethers.getContractFactory("Assessment");
  const assessment = await Assessment.deploy();
  await assessment.deployed();

  console.log(`Transaction System contract deployed to: ${assessment.address}`);

  // Optionally: Check if candidates were registered by getting candidates count
  const candidatesCount = await assessment.candidatesCount();
  console.log(`Total transaction registered: ${candidatesCount}`);
}

// Run the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
