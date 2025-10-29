// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title StakeManager (TURK-20 Lisans Sistemi)
/// @notice Kullanıcı 10 / 100 / 1000 TURK stake ederek sırasıyla Free, Pro, Node katmanına geçer.
/// @dev Şimdilik sadece arayüz, implementasyon Adım 2'de eklenecek.
interface IStakeManager {
    enum Tier { NONE, FREE, PRO, NODE }

    event Staked(address indexed user, uint256 amount, Tier newTier);
    event Unstaked(address indexed user, uint256 amount, Tier newTier);

    function stake(uint256 amount) external;
    function unstake(uint256 amount) external;
    function tierOf(address user) external view returns (Tier);
    function isLicensed(address user) external view returns (bool);
}
