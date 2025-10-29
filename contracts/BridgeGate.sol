// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BridgeGate (eTURK ↔ TURK Köprü Arayüzü)
/// @notice L1'de eTURK kilitlenince L2'de TURK mint eder.
interface IBridgeGate {
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    function mintTURK(address to, uint256 amount) external;
    function burnTURK(address from, uint256 amount) external;
}
