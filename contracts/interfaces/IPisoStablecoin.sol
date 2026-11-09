// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IPisoStablecoin
 * @notice Interface for institutional-grade compliant stablecoins deployed on PISO Chain.
 */
interface IPisoStablecoin is IERC20 {
    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed burner, address indexed from, uint256 amount);
    event EmergencyPaused(address indexed account);
    event EmergencyUnpaused(address indexed account);
    event RescueTokens(address indexed token, address indexed to, uint256 amount);

    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    function pause() external;
    function unpause() external;
    function rescueTokens(address tokenAddress, address to, uint256 amount) external;
}

