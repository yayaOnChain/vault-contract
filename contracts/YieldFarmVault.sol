// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// I create a Vault that is also a token (Shares)
contract YieldFarmVault is ERC20, Ownable {
    IERC20 public immutable underlyingAsset;

    constructor(address _asset) ERC20("Vault Share Token", "vstk") Ownable(msg.sender) {
        underlyingAsset = IERC20(_asset);
    }

    // --- MAIN ERC-4626 LOGIC ---

    function totalAssets() public view returns (uint256) {
        // Returns the total assets actually managed
        return underlyingAsset.balanceOf(address(this));
    }

    function deposit(uint256 _amount) external {
        uint256 shares = 0;
        if (totalSupply() == 0) {
            shares = _amount;
        } else {
            // Standard formula: assets -> shares
            shares = (_amount * totalSupply()) / totalAssets();
        }

        underlyingAsset.transferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, shares);
    }

    function withdraw(uint256 _shares) external {
        // Standard formula: shares -> assets
        uint256 amount = (_shares * totalAssets()) / totalSupply();

        _burn(msg.sender, _shares);
        underlyingAsset.transfer(msg.sender, amount);
    }

    // --- YIELD FARMING FEATURE (Simulation) ---

    /**
     * @dev This function simulates farming rewards.
     * In the real world, this could be interest from Aave or trading rewards.
     * Here, the Owner can send rewards to the contract.
     */
    function harvestRewards(uint256 _rewardAmount) external onlyOwner {
        // Simulation: Protocol earns profit and sends it to the Vault
        underlyingAsset.transferFrom(msg.sender, address(this), _rewardAmount);

        // IMPORTANT: No new shares are minted!
        // Because totalAssets increases but totalSupply (shares) remains the same,
        // the price per share automatically increases. This is where the "Yield" comes from.
    }
}