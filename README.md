# Solidity Vault Contracts

[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB15.svg)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Language-Solidity-e67a4e.svg)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive suite of smart contracts implementing vault functionality with yield farming capabilities, following the ERC-4626 standard for tokenized vaults. This project provides secure, efficient, and scalable solutions for decentralized finance (DeFi) asset management.

## 🚀 Overview

This repository contains two distinct vault implementations designed for different use cases in DeFi applications:

### 1. SimpleVault
A foundational vault contract that implements core deposit and withdrawal functionality with share-based accounting. Ideal for basic vault operations and educational purposes.

### 2. YieldFarmVault
An advanced vault contract that follows the ERC-4626 standard and includes yield farming capabilities, allowing for passive income generation through external protocols. This implementation is production-ready for yield-generating strategies.

## ✨ Key Features

- **ERC-4626 Compliance**: Advanced vault follows industry-standard interface for interoperability
- **Tokenized Shares**: Depositors receive vault shares proportional to their contribution
- **Yield Generation**: Harvest rewards mechanism for passive income
- **Secure Operations**: Proper access controls and validation mechanisms
- **Mathematical Precision**: Accurate share calculations preventing rounding attacks
- **Gas Optimized**: Efficient implementation reducing transaction costs
- **Comprehensive Testing**: Extensive test suite covering edge cases and security scenarios

## 📋 Contract Architecture

### SimpleVault

A straightforward vault implementation with the following characteristics:

- Deposit tokens to receive proportional shares
- Withdraw shares to reclaim underlying assets  
- Fair share calculation using the formula: `shares = (deposit_amount * total_supply) / total_assets`
- Immutable reference to the underlying ERC-20 token
- Basic accounting with total supply and individual balances

#### Functions:
- `deposit(uint256 _amount)` - Deposit tokens and receive shares
- `withdraw(uint256 _shares)` - Redeem shares for underlying tokens
- `balanceOf(address account)` - Check share balance of an account
- `totalSupply()` - Total shares in circulation

### YieldFarmVault

An advanced vault implementing the ERC-4626 standard with yield farming capabilities:

- Full ERC-20 compliance as vault shares
- Owner-controlled reward harvesting
- Automatic yield distribution through share price appreciation
- Standardized `totalAssets()` function
- Built-in access controls and ownership management

#### Functions:
- `deposit(uint256 _amount)` - Deposit assets and receive vault shares
- `withdraw(uint256 _shares)` - Redeem shares for underlying assets
- `totalAssets()` - Get total managed assets
- `harvestRewards(uint256 _rewardAmount)` - Add rewards to the vault (owner only)
- Standard ERC-20 functions inherited from OpenZeppelin

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vault-contract.git
cd vault-contract
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Compile the contracts:
```bash
npm run compile
# or
yarn compile
```

4. Run tests to verify the installation:
```bash
npm test
# or
yarn test
```

## 🛠️ Development & Deployment

### Local Development

1. Start a local Hardhat network:
```bash
npx hardhat node
```

2. Deploy contracts to the local network:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

### Testing

Run the comprehensive test suite:
```bash
npm test
```

Generate gas reports:
```bash
npm run test:gas
```

Generate coverage reports:
```bash
npm run test:coverage
```

### Deployment Scripts

Create deployment scripts in the `scripts/` directory following the Hardhat deployment patterns.

## 📊 Usage Examples

### Deploying a SimpleVault

1. Deploy the underlying token (e.g., MockERC20):
```javascript
const token = await ethers.deployContract("MockERC20", ["Test Token", "TTK", ethers.parseEther("1000000")]);
await token.waitForDeployment();
```

2. Deploy the SimpleVault with the token address:
```javascript
const vault = await ethers.deployContract("SimpleVault", [await token.getAddress()]);
await vault.waitForDeployment();
```

3. Interact with the vault:
```javascript
// Approve the vault to spend tokens
await token.approve(vault.getAddress(), ethers.parseEther("100"));

// Deposit tokens
await vault.deposit(ethers.parseEther("100"));

// Withdraw shares
await vault.withdraw(ethers.parseEther("50"));
```

### Using YieldFarmVault

The YieldFarmVault provides additional yield farming capabilities:

1. Deposit assets and earn yield:
```javascript
// Deposit works similarly to SimpleVault
await vault.deposit(ethers.parseEther("100"));

// Owner can harvest rewards to increase vault value
await vault.harvestRewards(ethers.parseEther("10"));
```

## 🔐 Security Considerations

### Access Controls
- Owner-only functions are protected with OpenZeppelin's Ownable pattern
- Critical operations require proper token approvals
- Unauthorized withdrawal attempts are prevented

### Mathematical Safeguards
- Share calculations maintain precision to prevent rounding attacks
- Division by zero protections in all mathematical operations
- Proper validation of deposit and withdrawal amounts

### Best Practices Implemented
- Immutable references to underlying tokens
- Proper event emissions for transparency
- Comprehensive validation of inputs
- Secure transfer patterns using OpenZeppelin contracts

### Audit Recommendations
- External security audit recommended before mainnet deployment
- Formal verification of mathematical formulas
- Stress testing with various edge cases
- Integration testing with external protocols

## 🏗️ Architecture Patterns

### ERC-4626 Compliance
The YieldFarmVault follows the ERC-4626 standard for tokenized vaults, ensuring:
- Standardized interface for DeFi integration
- Consistent behavior across different vault implementations
- Predictable share pricing mechanisms

### Share Price Mechanism
Both vaults implement a share price mechanism where:
- Share value appreciates with vault performance
- No dilution of existing shareholders when rewards are added
- Fair distribution of gains and losses

## 🤝 Contributing

We welcome contributions to improve the vault contracts! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🙏 Acknowledgments

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) for secure smart contract building blocks
- [Hardhat](https://hardhat.org/) for the development environment
- The Ethereum community for continuous innovation in DeFi standards