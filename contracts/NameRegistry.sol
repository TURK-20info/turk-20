// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NameRegistry (TURK-20 TC Alias Sistemi)
/// @notice Kullanıcılar TCxxxx formatında alias kaydeder.
interface INameRegistry {
    event Registered(address indexed user, string name);

    function register(string calldata name) external;
    function resolve(string calldata name) external view returns (address);
    function addressToName(address user) external view returns (string memory);
}
