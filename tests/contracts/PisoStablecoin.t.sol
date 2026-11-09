// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/PisoStablecoin.sol";

contract PisoStablecoinTest is Test {
    PisoStablecoin public token;

    address public admin = address(0x1);
    address public minter = address(0x2);
    address public alice = address(0x3);
    address public bob = address(0x4);

    event Mint(address indexed minter, address indexed to, uint256 amount);
    event Burn(address indexed burner, address indexed from, uint256 amount);

    function setUp() public {
        vm.prank(admin);
        token = new PisoStablecoin("PISO USD", "PISOUSD", 6, admin, minter);
    }

    function test_Initialization() public view {
        assertEq(token.name(), "PISO USD");
        assertEq(token.symbol(), "PISOUSD");
        assertEq(token.decimals(), 6);
        assertEq(token.totalSupply(), 0);
        assertTrue(token.hasRole(token.MINTER_ROLE(), minter));
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_AuthorizedMint() public {
        uint256 amount = 1_000_000 * 1e6; // 1M tokens

        vm.prank(minter);
        vm.expectEmit(true, true, false, true);
        emit Mint(minter, alice, amount);
        token.mint(alice, amount);

        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), amount);
    }

    function test_RevertWhen_UnauthorizedMint() public {
        vm.prank(alice);
        vm.expectRevert();
        token.mint(alice, 1000);
    }

    function testFuzz_MintAndBurn(uint256 mintAmount, uint256 burnAmount) public {
        vm.assume(mintAmount > 0 && mintAmount < 1e30);
        vm.assume(burnAmount > 0 && burnAmount <= mintAmount);

        vm.prank(minter);
        token.mint(alice, mintAmount);
        assertEq(token.balanceOf(alice), mintAmount);

        vm.prank(alice);
        token.burn(burnAmount);
        assertEq(token.balanceOf(alice), mintAmount - burnAmount);
        assertEq(token.totalSupply(), mintAmount - burnAmount);
    }

    function test_PauseBlocksTransfers() public {
        vm.prank(minter);
        token.mint(alice, 5000);

        vm.prank(admin);
        token.pause();

        vm.prank(alice);
        vm.expectRevert();
        token.transfer(bob, 1000);

        vm.prank(admin);
        token.unpause();

        vm.prank(alice);
        token.transfer(bob, 1000);
        assertEq(token.balanceOf(bob), 1000);
    }
}
