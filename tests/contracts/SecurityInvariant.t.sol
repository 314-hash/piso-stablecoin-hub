// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../contracts/PisoStablecoin.sol";

contract StablecoinHandler is Test {
    PisoStablecoin public token;
    address public minter;
    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);

    uint256 public sumOfBalances;

    constructor(PisoStablecoin _token, address _minter) {
        token = _token;
        minter = _minter;
    }

    function mint(uint256 amount) public {
        amount = bound(amount, 1, 100_000 * 1e6);
        vm.prank(minter);
        token.mint(alice, amount);
        sumOfBalances += amount;
    }

    function transfer(uint256 amount) public {
        uint256 bal = token.balanceOf(alice);
        if (bal == 0) return;
        amount = bound(amount, 1, bal);

        vm.prank(alice);
        token.transfer(bob, amount);
    }

    function burn(uint256 amount) public {
        uint256 bal = token.balanceOf(bob);
        if (bal == 0) return;
        amount = bound(amount, 1, bal);

        vm.prank(bob);
        token.burn(amount);
        sumOfBalances -= amount;
    }
}

contract StablecoinInvariantTest is Test {
    PisoStablecoin public token;
    StablecoinHandler public handler;

    address public admin = address(0x1);
    address public minter = address(0x2);

    function setUp() public {
        vm.prank(admin);
        token = new PisoStablecoin("PISO Stablecoin", "PISOSTABLE", 6, admin, minter);

        handler = new StablecoinHandler(token, minter);
        targetContract(address(handler));
    }

    /// @notice Invariant: Token Total Supply must strictly equal the sum of tracked account balances
    function invariant_TotalSupplyEqualsSumOfBalances() public view {
        assertEq(token.totalSupply(), handler.sumOfBalances());
    }

    /// @notice Invariant: Only accounts with MINTER_ROLE can expand supply
    function invariant_RoleIntegrity() public view {
        assertTrue(token.hasRole(token.MINTER_ROLE(), minter));
        assertFalse(token.hasRole(token.MINTER_ROLE(), address(handler)));
    }
}

