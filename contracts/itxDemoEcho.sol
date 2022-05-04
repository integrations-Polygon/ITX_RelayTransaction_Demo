//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract itxDemo7 {
    event Echo(string message);

    function echo(string calldata message) external {
        emit Echo(message);
    }
}
