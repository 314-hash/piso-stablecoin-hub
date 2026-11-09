// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ITokenRegistry
 * @notice Interface for the official PISO Chain Stablecoin Registry.
 * @dev Governed registry tracking approved, verified, and audited stablecoins on PISO Chain.
 */
interface ITokenRegistry {
    enum ProvenanceType {
        NATIVE_ISSUED,      // Minted natively on PISO Chain by authorized issuer
        CANONICAL_BRIDGED,  // Bridged via canonical sovereign lock-and-mint bridge
        WRAPPED_ASSET       // Synthetically or custodial backed wrapped token
    }

    struct StablecoinMetadata {
        address tokenAddress;
        string name;
        string symbol;
        uint8 decimals;
        string issuerName;
        string issuerWebsite;
        string reserveProofURI;
        string originalNetwork;
        ProvenanceType provenance;
        bool isVerified;
        bool isDeprecated;
        uint64 registeredAt;
        uint64 verifiedAt;
    }

    event TokenRegistered(
        address indexed tokenAddress,
        string symbol,
        string issuerName,
        ProvenanceType provenance,
        uint64 timestamp
    );

    event TokenVerified(address indexed tokenAddress, address indexed verifier, uint64 timestamp);
    event TokenVerificationRevoked(address indexed tokenAddress, string reason, uint64 timestamp);
    event ReserveProofUpdated(address indexed tokenAddress, string newProofURI, uint64 timestamp);
    event TokenDeprecated(address indexed tokenAddress, bool isDeprecated, uint64 timestamp);

    function registerToken(
        address tokenAddress,
        string calldata issuerName,
        string calldata issuerWebsite,
        string calldata reserveProofURI,
        string calldata originalNetwork,
        ProvenanceType provenance
    ) external;

    function setTokenVerification(address tokenAddress, bool verified) external;
    function updateReserveProof(address tokenAddress, string calldata newProofURI) external;
    function setTokenDeprecated(address tokenAddress, bool deprecated) external;

    function getToken(address tokenAddress) external view returns (StablecoinMetadata memory);
    function isTokenRegistered(address tokenAddress) external view returns (bool);
    function isTokenVerified(address tokenAddress) external view returns (bool);
    function getAllRegisteredTokens() external view returns (address[] memory);
    function getRegisteredTokenCount() external view returns (uint256);
}
