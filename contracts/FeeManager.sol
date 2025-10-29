// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FeeManager (TURK-20 Sponsor Gas Kota Yönetimi)
/// @notice Lisanslı kullanıcıların günlük ücretsiz işlem kotasını izler.
interface IFeeManager {
    event QuotaUsed(address indexed user, uint256 dayIndex, uint256 used, uint256 max);

    function setDailyQuota(uint256 freeQ, uint256 proQ) external;
    function canSponsor(address user) external view returns (bool);
    function consumeQuota(address user) external;
}
