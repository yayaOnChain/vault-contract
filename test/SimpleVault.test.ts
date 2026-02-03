import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SimpleVault, MockERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SimpleVault", function () {
  // Fixture to deploy contracts and setup initial state
  async function deployVaultFixture() {
    const [owner, user1, user2, user3]: SignerWithAddress[] = await ethers.getSigners();

    // Deploy Mock ERC20 Token
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    const token: MockERC20 = await MockERC20Factory.deploy(
      "Mock Token",
      "MTK",
      ethers.parseEther("1000000") // 1 million tokens
    );
    await token.waitForDeployment();

    // Deploy SimpleVault
    const SimpleVaultFactory = await ethers.getContractFactory("SimpleVault");
    const vault: SimpleVault = await SimpleVaultFactory.deploy(await token.getAddress());
    await vault.waitForDeployment();

    // Mint tokens for user testing
    await token.mint(user1.address, ethers.parseEther("10000"));
    await token.mint(user2.address, ethers.parseEther("10000"));
    await token.mint(user3.address, ethers.parseEther("10000"));

    return { vault, token, owner, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { vault, token } = await loadFixture(deployVaultFixture);
      expect(await vault.token()).to.equal(await token.getAddress());
    });

    it("Should initialize with zero total supply", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      expect(await vault.totalSupply()).to.equal(0);
    });

    it("Should initialize with zero balance for all users", async function () {
      const { vault, user1, user2 } = await loadFixture(deployVaultFixture);
      expect(await vault.balanceOf(user1.address)).to.equal(0);
      expect(await vault.balanceOf(user2.address)).to.equal(0);
    });
  });

  describe("Deposit - First Deposit", function () {
    it("Should mint 1:1 shares on first deposit", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      expect(await vault.balanceOf(user1.address)).to.equal(depositAmount);
      expect(await vault.totalSupply()).to.equal(depositAmount);
    });

    it("Should transfer tokens from user to vault", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");
      const initialBalance: bigint = await token.balanceOf(user1.address);

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      expect(await token.balanceOf(user1.address)).to.equal(
        initialBalance - depositAmount
      );
      expect(await token.balanceOf(await vault.getAddress())).to.equal(depositAmount);
    });

    it("Should revert if user has insufficient balance", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100000"); // More than user's balance

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await expect(
        vault.connect(user1).deposit(depositAmount)
      ).to.be.reverted;
    });

    it("Should revert if user has not approved vault", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await expect(
        vault.connect(user1).deposit(depositAmount)
      ).to.be.reverted;
    });
  });

  describe("Deposit - Subsequent Deposits", function () {
    it("Should calculate shares correctly for second deposit with same ratio", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      // First deposit
      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Second deposit with same amount
      await token.connect(user2).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user2).deposit(depositAmount);

      expect(await vault.balanceOf(user2.address)).to.equal(depositAmount);
      expect(await vault.totalSupply()).to.equal(depositAmount * 2n);
    });

    it("Should calculate shares proportionally for different deposit amounts", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);
      
      // User1 deposits 100 tokens
      const firstDeposit: bigint = ethers.parseEther("100");
      await token.connect(user1).approve(await vault.getAddress(), firstDeposit);
      await vault.connect(user1).deposit(firstDeposit);

      // User2 deposits 50 tokens (half of user1)
      const secondDeposit: bigint = ethers.parseEther("50");
      await token.connect(user2).approve(await vault.getAddress(), secondDeposit);
      await vault.connect(user2).deposit(secondDeposit);

      // User2 should receive 50 shares (half of user1)
      expect(await vault.balanceOf(user2.address)).to.equal(secondDeposit);
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("150"));
    });

    it("Should handle multiple deposits from same user", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      
      const firstDeposit: bigint = ethers.parseEther("100");
      await token.connect(user1).approve(await vault.getAddress(), firstDeposit);
      await vault.connect(user1).deposit(firstDeposit);

      const secondDeposit: bigint = ethers.parseEther("50");
      await token.connect(user1).approve(await vault.getAddress(), secondDeposit);
      await vault.connect(user1).deposit(secondDeposit);

      expect(await vault.balanceOf(user1.address)).to.equal(ethers.parseEther("150"));
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("150"));
    });

    it("Should calculate shares correctly when vault has profits", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);
      
      // User1 deposit 100 tokens
      const firstDeposit: bigint = ethers.parseEther("100");
      await token.connect(user1).approve(await vault.getAddress(), firstDeposit);
      await vault.connect(user1).deposit(firstDeposit);

      // Simulate profit: transfer 50 tokens to vault (without minting shares)
      const profit: bigint = ethers.parseEther("50");
      await token.connect(user2).transfer(await vault.getAddress(), profit);

      // Now vault has 150 tokens but only 100 shares
      // User2 deposits 75 tokens should receive 50 shares (75 * 100 / 150)
      const secondDeposit: bigint = ethers.parseEther("75");
      await token.connect(user2).approve(await vault.getAddress(), secondDeposit);
      await vault.connect(user2).deposit(secondDeposit);

      expect(await vault.balanceOf(user2.address)).to.equal(ethers.parseEther("50"));
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("150"));
    });
  });

  describe("Withdraw", function () {
    it("Should allow user to withdraw all their shares", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      const sharesBefore: bigint = await vault.balanceOf(user1.address);
      await vault.connect(user1).withdraw(sharesBefore);

      expect(await vault.balanceOf(user1.address)).to.equal(0);
      expect(await vault.totalSupply()).to.equal(0);
    });

    it("Should transfer correct amount of tokens back to user", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      const balanceBefore: bigint = await token.balanceOf(user1.address);
      const shares: bigint = await vault.balanceOf(user1.address);
      
      await vault.connect(user1).withdraw(shares);

      expect(await token.balanceOf(user1.address)).to.equal(
        balanceBefore + depositAmount
      );
    });

    it("Should allow partial withdrawal", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      // Withdraw half shares
      const halfShares: bigint = ethers.parseEther("50");
      await vault.connect(user1).withdraw(halfShares);

      expect(await vault.balanceOf(user1.address)).to.equal(ethers.parseEther("50"));
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("50"));
    });

    it("Should distribute profits proportionally on withdrawal", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);
      
      // User1 and User2 each deposit 100 tokens
      const depositAmount: bigint = ethers.parseEther("100");
      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await token.connect(user2).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user2).deposit(depositAmount);

      // Simulate profit: transfer 100 tokens to vault
      const profit: bigint = ethers.parseEther("100");
      await token.connect(user1).transfer(await vault.getAddress(), profit);

      // Now vault has 300 tokens, 200 shares
      // User1 withdraws 100 shares should receive 150 tokens (100 * 300 / 200)
      const balanceBefore: bigint = await token.balanceOf(user1.address);
      await vault.connect(user1).withdraw(ethers.parseEther("100"));

      expect(await token.balanceOf(user1.address)).to.equal(
        balanceBefore + ethers.parseEther("150")
      );
    });

    it("Should revert when withdrawing more shares than balance", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      await expect(
        vault.connect(user1).withdraw(ethers.parseEther("200"))
      ).to.be.reverted;
    });

    it("Should revert when user has no shares", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);

      await expect(
        vault.connect(user1).withdraw(ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  describe("Multiple Users Scenario", function () {
    it("Should handle deposits and withdrawals from multiple users correctly", async function () {
      const { vault, token, user1, user2, user3 } = await loadFixture(deployVaultFixture);

      // User1 deposits 100
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // User2 deposits 200
      await token.connect(user2).approve(await vault.getAddress(), ethers.parseEther("200"));
      await vault.connect(user2).deposit(ethers.parseEther("200"));

      // User3 deposits 150
      await token.connect(user3).approve(await vault.getAddress(), ethers.parseEther("150"));
      await vault.connect(user3).deposit(ethers.parseEther("150"));

      // Check total supply
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("450"));

      // User2 withdraws 50 shares
      await vault.connect(user2).withdraw(ethers.parseEther("50"));

      expect(await vault.balanceOf(user2.address)).to.equal(ethers.parseEther("150"));
      expect(await vault.totalSupply()).to.equal(ethers.parseEther("400"));
    });

    it("Should maintain correct share ratios after multiple operations", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);

      // User1 deposits 100
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // Profit enters
      await token.connect(user2).transfer(await vault.getAddress(), ethers.parseEther("100"));

      // User2 deposits 100 (should receive 50 shares because vault value = 200)
      await token.connect(user2).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user2).deposit(ethers.parseEther("100"));

      // User1 has 100 shares, User2 has 50 shares, total 150 shares
      // Vault has 300 tokens
      // User1 withdraws all (100 shares) should receive 200 tokens (100 * 300 / 150)
      const balanceBefore: bigint = await token.balanceOf(user1.address);
      await vault.connect(user1).withdraw(await vault.balanceOf(user1.address));

      expect(await token.balanceOf(user1.address)).to.equal(
        balanceBefore + ethers.parseEther("200")
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small deposits", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const smallAmount: bigint = 1n; // 1 wei

      await token.connect(user1).approve(await vault.getAddress(), smallAmount);
      await vault.connect(user1).deposit(smallAmount);

      expect(await vault.balanceOf(user1.address)).to.equal(smallAmount);
    });

    it("Should handle very large deposits", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const largeAmount: bigint = ethers.parseEther("1000000");

      await token.mint(user1.address, largeAmount);
      await token.connect(user1).approve(await vault.getAddress(), largeAmount);
      await vault.connect(user1).deposit(largeAmount);

      expect(await vault.balanceOf(user1.address)).to.equal(largeAmount);
    });

    it("Should handle zero balance withdrawal attempt", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);

      await expect(
        vault.connect(user1).withdraw(0)
      ).to.be.reverted; // Division by zero in formula
    });

    it("Should handle rounding in share calculation", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);

      // Deposit that will cause rounding
      await token.connect(user1).approve(await vault.getAddress(), 100n);
      await vault.connect(user1).deposit(100n);

      // Deposit amount that is not divisible
      await token.connect(user2).approve(await vault.getAddress(), 33n);
      await vault.connect(user2).deposit(33n);

      // Verify shares are calculated (may have rounding)
      const user2Shares: bigint = await vault.balanceOf(user2.address);
      expect(user2Shares).to.be.greaterThan(0);
    });
  });

  describe("Security & Access Control", function () {
    it("Should not allow withdrawal of other user's shares", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);

      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      // User2 tries to withdraw User1's shares
      await expect(
        vault.connect(user2).withdraw(ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should maintain accounting integrity across operations", async function () {
      const { vault, token, user1, user2 } = await loadFixture(deployVaultFixture);

      // Multiple operations
      await token.connect(user1).approve(await vault.getAddress(), ethers.parseEther("100"));
      await vault.connect(user1).deposit(ethers.parseEther("100"));

      await token.connect(user2).approve(await vault.getAddress(), ethers.parseEther("50"));
      await vault.connect(user2).deposit(ethers.parseEther("50"));

      await vault.connect(user1).withdraw(ethers.parseEther("25"));

      // Total shares must equal sum of individual balances
      const user1Balance: bigint = await vault.balanceOf(user1.address);
      const user2Balance: bigint = await vault.balanceOf(user2.address);
      const totalSupply: bigint = await vault.totalSupply();

      expect(totalSupply).to.equal(user1Balance + user2Balance);
    });
  });

  describe("Gas Optimization Checks", function () {
    it("Should consume reasonable gas for deposit", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      const tx = await vault.connect(user1).deposit(depositAmount);
      const receipt = await tx.wait();

      // Log gas used (for monitoring)
      console.log("      Gas used for deposit:", receipt?.gasUsed.toString());
      expect(receipt?.gasUsed).to.be.lessThan(200000n); // Reasonable gas limit
    });

    it("Should consume reasonable gas for withdrawal", async function () {
      const { vault, token, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount: bigint = ethers.parseEther("100");

      await token.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount);

      const tx = await vault.connect(user1).withdraw(depositAmount);
      const receipt = await tx.wait();

      console.log("      Gas used for withdrawal:", receipt?.gasUsed.toString());
      expect(receipt?.gasUsed).to.be.lessThan(150000n);
    });
  });
});