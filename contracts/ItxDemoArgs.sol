//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract ItxDemoArgs {
    string private name;
    uint256 private number;
    address private demoAddress;

    constructor(
        string memory _name,
        uint256 _number,
        address _demoAddress
    ) {
        name = _name;
        number = _number;
        demoAddress = _demoAddress;
    }

    function getName() external view returns (string memory) {
        return name;
    }

    function getNumber() external view returns (uint256) {
        return number;
    }

    function getDemoAddress() external view returns (address) {
        return demoAddress;
    }
}
