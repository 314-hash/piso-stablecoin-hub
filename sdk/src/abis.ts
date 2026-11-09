import { parseAbi } from 'viem';

export const tokenRegistryAbi = parseAbi([
  'function registerToken(address tokenAddress, string issuerName, string issuerWebsite, string reserveProofURI, string originalNetwork, uint8 provenance) external',
  'function setTokenVerification(address tokenAddress, bool verified) external',
  'function updateReserveProof(address tokenAddress, string newProofURI) external',
  'function setTokenDeprecated(address tokenAddress, bool deprecated) external',
  'function getToken(address tokenAddress) external view returns ((address tokenAddress, string name, string symbol, uint8 decimals, string issuerName, string issuerWebsite, string reserveProofURI, string originalNetwork, uint8 provenance, bool isVerified, bool isDeprecated, uint64 registeredAt, uint64 verifiedAt))',
  'function isTokenRegistered(address tokenAddress) external view returns (bool)',
  'function isTokenVerified(address tokenAddress) external view returns (bool)',
  'function getAllRegisteredTokens() external view returns (address[])',
  'function getRegisteredTokenCount() external view returns (uint256)',
  'event TokenRegistered(address indexed tokenAddress, string symbol, string issuerName, uint8 provenance, uint64 timestamp)',
  'event TokenVerified(address indexed tokenAddress, address indexed verifier, uint64 timestamp)',
  'event TokenVerificationRevoked(address indexed tokenAddress, string reason, uint64 timestamp)',
  'event ReserveProofUpdated(address indexed tokenAddress, string newProofURI, uint64 timestamp)',
  'event TokenDeprecated(address indexed tokenAddress, bool isDeprecated, uint64 timestamp)'
]);

export const pisoStablecoinAbi = parseAbi([
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function burn(uint256 amount) external',
  'function burnFrom(address account, uint256 amount) external',
  'function pause() external',
  'function unpause() external',
  'function paused() external view returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event Mint(address indexed minter, address indexed to, uint256 amount)',
  'event Burn(address indexed burner, address indexed from, uint256 amount)',
  'event EmergencyPaused(address indexed account)',
  'event EmergencyUnpaused(address indexed account)'
]);
