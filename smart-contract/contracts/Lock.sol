// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract Lock {
    uint public unlockTime;
    
    constructor(uint _unlockTime) payable {
        unlockTime = _unlockTime;
    }
}