// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GasSponsor (TURK-20 Gas Havuzu)
/// @notice Relayer'ların gas ücretlerini FeePool'dan karşılar.
interface IGasSponsor {
    event Sponsored(address indexed user, address target, bytes4 selector, uint256 gasCostWei);

    function setForwarder(address forwarder) external;
    function setFeeManager(address fm) external;
    function sponsorCall(bytes calldata forwardRequest, bytes calldata signature) external payable;
}
