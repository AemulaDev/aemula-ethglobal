// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

contract AemulaETHGlobal {
    // mappings
    // users to their subscriptionExpiry timestamp in seconds
    mapping(address => uint256) public users;
    // users to an array of their published articles by IPFS CID
    mapping(address => string[]) public authorArticles;
    // IPFS CIDs to their author's address
    mapping(string => address) public articles;

}