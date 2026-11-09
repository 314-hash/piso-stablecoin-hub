// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/TokenRegistry.sol";
import "../../contracts/PisoStablecoin.sol";

contract TokenRegistryTest is Test {
    TokenRegistry public registry;
    PisoStablecoin public stablecoin;

    address public admin = address(0x1);
    address public verifier = address(0x2);
    address public minter = address(0x3);
    address public alice = address(0x4);
    address public bob = address(0x5);

    function setUp() public {
        vm.startPrank(admin);
        registry = new TokenRegistry(admin);
        stablecoin = new PisoStablecoin("PISO Philippine Peso", "PISOP", 18, admin, minter);
        vm.stopPrank();
    }

    function test_InitialDeployment() public view {
        assertTrue(registry.hasRole(registry.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(registry.hasRole(registry.REGISTRAR_ROLE(), admin));
        assertTrue(registry.hasRole(registry.VERIFIER_ROLE(), admin));
        assertEq(registry.getRegisteredTokenCount(), 0);
    }

    function test_RegisterTokenSuccess() public {
        vm.prank(admin);
        registry.registerToken(
            address(stablecoin),
            "PISO Reserve Foundation",
            "https://pisochain.com",
            "ipfs://proof-uri",
            "PISO Native L1",
            ITokenRegistry.ProvenanceType.NATIVE_ISSUED
        );

        assertTrue(registry.isTokenRegistered(address(stablecoin)));
        assertFalse(registry.isTokenVerified(address(stablecoin)));
        assertEq(registry.getRegisteredTokenCount(), 1);

        ITokenRegistry.StablecoinMetadata memory meta = registry.getToken(address(stablecoin));
        assertEq(meta.name, "PISO Philippine Peso");
        assertEq(meta.symbol, "PISOP");
        assertEq(meta.decimals, 18);
        assertEq(meta.issuerName, "PISO Reserve Foundation");
    }

    function test_RevertWhen_DuplicateRegistration() public {
        vm.startPrank(admin);
        registry.registerToken(
            address(stablecoin),
            "PISO Reserve Foundation",
            "https://pisochain.com",
            "ipfs://proof-uri",
            "PISO Native L1",
            ITokenRegistry.ProvenanceType.NATIVE_ISSUED
        );

        vm.expectRevert(abi.encodeWithSelector(TokenRegistry.TokenAlreadyRegistered.selector, address(stablecoin)));
        registry.registerToken(
            address(stablecoin),
            "Duplicate Issuer",
            "https://pisochain.com",
            "ipfs://proof-uri",
            "PISO Native L1",
            ITokenRegistry.ProvenanceType.NATIVE_ISSUED
        );
        vm.stopPrank();
    }

    function test_VerifyTokenRoleEnforcement() public {
        vm.prank(admin);
        registry.registerToken(
            address(stablecoin),
            "PISO Reserve Foundation",
            "https://pisochain.com",
            "ipfs://proof-uri",
            "PISO Native L1",
            ITokenRegistry.ProvenanceType.NATIVE_ISSUED
        );

        // Unauthorized user attempts verification
        vm.prank(alice);
        vm.expectRevert();
        registry.setTokenVerification(address(stablecoin), true);

        // Authorized admin verifies token
        vm.prank(admin);
        registry.setTokenVerification(address(stablecoin), true);
        assertTrue(registry.isTokenVerified(address(stablecoin)));
    }

    function test_PauseCircuitBreaker() public {
        vm.prank(admin);
        registry.pause();

        vm.prank(admin);
        vm.expectRevert();
        registry.registerToken(
            address(stablecoin),
            "PISO Reserve Foundation",
            "https://pisochain.com",
            "ipfs://proof-uri",
            "PISO Native L1",
            ITokenRegistry.ProvenanceType.NATIVE_ISSUED
        );
    }
}

