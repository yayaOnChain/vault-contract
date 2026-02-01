# Solidity Vault Contracts

A comprehensive suite of smart contracts implementing vault functionality with yield farming capabilities, following the ERC-4626 standard for tokenized vaults.

## Overview

This project contains two distinct vault implementations:

### 1. SimpleVault
A basic vault contract that implements core depoupdate @README.md dalam bahasa inggris, buatkan dalam format yang bagus, menarik dan profesional sesuai konten dalam project inisit and withdrawal functionality with share-based accounting.

### 2. YieldFarmVault
An advanced vault contract that follows the ERC-4626 standard and includes yield farming capabilities, allowing for passive income generation through external protocols.

## Features

- **Tokenized Shares**: Depositors receive vault shares proportional to their contribution
- **ERC-4626 Compliance**: Advanced vault follows industry-standard interface
- **Yield Generation**: Harvest rewards mechanism for passive income
- **Secure Operations**: Proper access controls and validation
- **Mathematical Precision**: Accurate share calculations for fair distribution

## Contract Details

### SimpleVault

A straightforward vault implementation with the following characteristics:

- Deposit tokens to receive proportional shares
- Withdraw shares to reclaim underlying assets
- Fair share calculation using the formula: `shares = (deposit_amount * total_supply) / total_assets`

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

#### Functions:
- `deposit(uint256 _amount)` - Deposit assets and receive vault shares
- `withdraw(uint256 _shares)` - Redeem shares for underlying assets
- `totalAssets()` - Get total managed assets
- `harvestRewards(uint256 _rewardAmount)` - Add rewards to the vault (owner only)
- Standard ERC-20 functions inherited from OpenZeppelin

## Security Considerations

- All external calls are properly validated
- Access controls prevent unauthorized operations
- Share calculations maintain precision to prevent rounding attacks
- Yield distribution occurs without diluting existing shareholders

## Dependencies

- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts) v4.x
  - `@openzeppelin/contracts/token/ERC20/IERC20.sol`
  - `@openzeppelin/contracts/token/ERC20/ERC20.sol`
  - `@openzeppelin/contracts/access/Ownable.sol`

## Usage

1. Deploy the vault contract with the address of the underlying token
2. Approve the vault contract to spend your tokens
3. Call `deposit(amount)` to contribute assets and receive shares
4. Monitor your share balance and the vault's performance
5. Call `withdraw(shares)` to redeem your portion of the vault

For the YieldFarmVault, the owner can call `harvestRewards(rewardAmount)` to add external rewards to the vault, increasing the value of all existing shares.

## License

MIT License - See the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
