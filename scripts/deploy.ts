import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  // Deploy MockERC20 token first (for testing purposes)
  console.log("Deploying MockERC20 token...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20.deploy(
    "Test Token", 
    "TTK", 
    ethers.parseEther("1000000") // 1 million tokens
  );
  await mockToken.waitForDeployment();
  console.log(`MockERC20 deployed to: ${await mockToken.getAddress()}`);

  // Deploy SimpleVault
  console.log("Deploying SimpleVault...");
  const SimpleVault = await ethers.getContractFactory("SimpleVault");
  const simpleVault = await SimpleVault.deploy(await mockToken.getAddress());
  await simpleVault.waitForDeployment();
  console.log(`SimpleVault deployed to: ${await simpleVault.getAddress()}`);

  // Deploy YieldFarmVault
  console.log("Deploying YieldFarmVault...");
  const YieldFarmVault = await ethers.getContractFactory("YieldFarmVault");
  const yieldFarmVault = await YieldFarmVault.deploy(await mockToken.getAddress());
  await yieldFarmVault.waitForDeployment();
  console.log(`YieldFarmVault deployed to: ${await yieldFarmVault.getAddress()}`);

  console.log("\nDeployment completed successfully!");
  console.log("\nContract addresses:");
  console.log(`MockERC20 Token: ${await mockToken.getAddress()}`);
  console.log(`SimpleVault: ${await simpleVault.getAddress()}`);
  console.log(`YieldFarmVault: ${await yieldFarmVault.getAddress()}`);

  // Optionally, transfer some tokens to a test address for immediate testing
  const [deployer] = await ethers.getSigners();
  console.log(`\nTransfering 1000 test tokens to deployer: ${deployer.address}`);
  await mockToken.transfer(deployer.address, ethers.parseEther("1000"));
}

// Run the deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});