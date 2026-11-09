// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPisoStablecoin.sol";

/**
 * @title PisoStablecoin
 * @notice Enterprise-grade, regulatory-compliant stablecoin implementation for PISO Chain.
 * @dev Implements OpenZeppelin ERC20, Burnable, Pausable, AccessControl, and SafeERC20 asset rescue.
 */
contract PisoStablecoin is IPisoStablecoin, ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant RESCUER_ROLE = keccak256("RESCUER_ROLE");

    uint8 private immutable _decimals;

    // Errors
    error ZeroAddressNotAllowed();
    error InvalidAmount();
    error CannotRescueSelf();

    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        address initialAdmin,
        address initialMinter
    ) ERC20(tokenName, tokenSymbol) {
        if (initialAdmin == address(0) || initialMinter == address(0)) {
            revert ZeroAddressNotAllowed();
        }

        _decimals = tokenDecimals;

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(PAUSER_ROLE, initialAdmin);
        _grantRole(RESCUER_ROLE, initialAdmin);
        _grantRole(MINTER_ROLE, initialMinter);
    }

    /**
     * @notice Returns custom token decimal precision (e.g. 6 for USD or 18 for PHP).
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    /**
     * @notice Mints new stablecoins to an authorized recipient.
     * @param to Recipient address.
     * @param amount Amount in token smallest units.
     */
    function mint(address to, uint256 amount) external override onlyRole(MINTER_ROLE) whenNotPaused {
        if (to == address(0)) revert ZeroAddressNotAllowed();
        if (amount == 0) revert InvalidAmount();

        _mint(to, amount);
        emit Mint(msg.sender, to, amount);
    }

    /**
     * @notice Burns stablecoins from the caller's balance.
     * @param amount Amount to burn.
     */
    function burn(uint256 amount) public override(ERC20Burnable, IPisoStablecoin) whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        super.burn(amount);
        emit Burn(msg.sender, msg.sender, amount);
    }

    /**
     * @notice Burns stablecoins from an account using an allowance.
     * @param account Target account.
     * @param amount Amount to burn.
     */
    function burnFrom(address account, uint256 amount) public override(ERC20Burnable, IPisoStablecoin) whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        super.burnFrom(account, amount);
        emit Burn(msg.sender, account, amount);
    }

    /**
     * @notice Emergency circuit breaker pausing all transfers, mints, and burns.
     */
    function pause() external override onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPaused(msg.sender);
    }

    /**
     * @notice Unpauses contract operations.
     */
    function unpause() external override onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpaused(msg.sender);
    }

    /**
     * @notice Rescues accidentally trapped ERC-20 tokens (excluding this contract itself).
     */
    function rescueTokens(
        address tokenAddress,
        address to,
        uint256 amount
    ) external override onlyRole(RESCUER_ROLE) nonReentrant {
        if (tokenAddress == address(this)) revert CannotRescueSelf();
        if (to == address(0)) revert ZeroAddressNotAllowed();
        if (amount == 0) revert InvalidAmount();

        IERC20(tokenAddress).safeTransfer(to, amount);
        emit RescueTokens(tokenAddress, to, amount);
    }

    // Required override by Solidity for ERC20 and ERC20Pausable
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}

