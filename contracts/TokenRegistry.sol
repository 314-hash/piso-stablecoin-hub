// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./interfaces/ITokenRegistry.sol";

/**
 * @title TokenRegistry
 * @notice Central, verifiable on-chain registry for stablecoins deployed or bridged on PISO Chain.
 * @dev Governed by multi-role access control for administration, registration, and independent verification.
 */
contract TokenRegistry is ITokenRegistry, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    // Storage
    address[] private _registeredTokens;
    mapping(address => StablecoinMetadata) private _tokens;
    mapping(address => bool) private _isRegistered;

    // Errors
    error ZeroAddressNotAllowed();
    error TokenAlreadyRegistered(address tokenAddress);
    error TokenNotRegistered(address tokenAddress);
    error InvalidMetadata();

    constructor(address initialAdmin) {
        if (initialAdmin == address(0)) revert ZeroAddressNotAllowed();

        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(REGISTRAR_ROLE, initialAdmin);
        _grantRole(VERIFIER_ROLE, initialAdmin);
    }

    /**
     * @notice Registers a new stablecoin in the hub registry.
     * @dev Fetches name, symbol, and decimals directly from the token contract via IERC20Metadata.
     */
    function registerToken(
        address tokenAddress,
        string calldata issuerName,
        string calldata issuerWebsite,
        string calldata reserveProofURI,
        string calldata originalNetwork,
        ProvenanceType provenance
    ) external override onlyRole(REGISTRAR_ROLE) whenNotPaused nonReentrant {
        if (tokenAddress == address(0)) revert ZeroAddressNotAllowed();
        if (_isRegistered[tokenAddress]) revert TokenAlreadyRegistered(tokenAddress);
        if (bytes(issuerName).length == 0) revert InvalidMetadata();

        // Introspect ERC-20 metadata directly into storage
        IERC20Metadata token = IERC20Metadata(tokenAddress);
        uint64 currentTime = uint64(block.timestamp);

        StablecoinMetadata storage meta = _tokens[tokenAddress];
        meta.tokenAddress = tokenAddress;
        meta.name = token.name();
        meta.symbol = token.symbol();
        meta.decimals = token.decimals();
        meta.issuerName = issuerName;
        meta.issuerWebsite = issuerWebsite;
        meta.reserveProofURI = reserveProofURI;
        meta.originalNetwork = originalNetwork;
        meta.provenance = provenance;
        meta.isVerified = false;
        meta.isDeprecated = false;
        meta.registeredAt = currentTime;
        meta.verifiedAt = 0;

        _isRegistered[tokenAddress] = true;
        _registeredTokens.push(tokenAddress);

        emit TokenRegistered(tokenAddress, meta.symbol, issuerName, provenance, currentTime);
    }

    /**
     * @notice Updates the verification status of a registered stablecoin.
     * @param tokenAddress Address of the token.
     * @param verified True to verify, false to revoke verification.
     */
    function setTokenVerification(
        address tokenAddress,
        bool verified
    ) external override onlyRole(VERIFIER_ROLE) whenNotPaused {
        if (!_isRegistered[tokenAddress]) revert TokenNotRegistered(tokenAddress);

        _tokens[tokenAddress].isVerified = verified;
        uint64 currentTime = uint64(block.timestamp);

        if (verified) {
            _tokens[tokenAddress].verifiedAt = currentTime;
            emit TokenVerified(tokenAddress, msg.sender, currentTime);
        } else {
            _tokens[tokenAddress].verifiedAt = 0;
            emit TokenVerificationRevoked(tokenAddress, "Verification revoked by verifier", currentTime);
        }
    }

    /**
     * @notice Updates the Proof of Reserves URI for an existing stablecoin.
     */
    function updateReserveProof(
        address tokenAddress,
        string calldata newProofURI
    ) external override onlyRole(REGISTRAR_ROLE) whenNotPaused {
        if (!_isRegistered[tokenAddress]) revert TokenNotRegistered(tokenAddress);

        _tokens[tokenAddress].reserveProofURI = newProofURI;
        emit ReserveProofUpdated(tokenAddress, newProofURI, uint64(block.timestamp));
    }

    /**
     * @notice Marks a token as deprecated or active.
     */
    function setTokenDeprecated(
        address tokenAddress,
        bool deprecated
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!_isRegistered[tokenAddress]) revert TokenNotRegistered(tokenAddress);

        _tokens[tokenAddress].isDeprecated = deprecated;
        emit TokenDeprecated(tokenAddress, deprecated, uint64(block.timestamp));
    }

    /**
     * @notice Pause registry operations during emergencies.
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause registry operations.
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // View Functions

    function getToken(address tokenAddress) external view override returns (StablecoinMetadata memory) {
        if (!_isRegistered[tokenAddress]) revert TokenNotRegistered(tokenAddress);
        return _tokens[tokenAddress];
    }

    function isTokenRegistered(address tokenAddress) external view override returns (bool) {
        return _isRegistered[tokenAddress];
    }

    function isTokenVerified(address tokenAddress) external view override returns (bool) {
        return _isRegistered[tokenAddress] && _tokens[tokenAddress].isVerified;
    }

    function getAllRegisteredTokens() external view override returns (address[] memory) {
        return _registeredTokens;
    }

    function getRegisteredTokenCount() external view override returns (uint256) {
        return _registeredTokens.length;
    }
}

